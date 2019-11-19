import {UserInputError} from 'apollo-server';

import {
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  NewInflectionTableInput,
  EditInflectionTableInput,
  InflectionTableRowInput,
  InflectedFormInput,
} from '../../graphql/types';

import Mutator from '../mutator';
import FieldSet from '../field-set';

import {InflectionTableRow, InflectionTableLayoutRow} from './types';
import {
  validateName,
  validateFormInflectionPattern,
  validateFormDisplayName,
} from './validators';
import buildTableLayout from './build-table-layout';

class InflectionTableMut extends Mutator {
  public async insert({
    partOfSpeechId,
    name,
    layout,
  }: NewInflectionTableInput): Promise<InflectionTableRow> {
    const {db} = this;
    const {PartOfSpeech, InflectionTable} = this.model;
    const {InflectionTableLayoutMut} = this.mut;

    const partOfSpeech = await PartOfSpeech.byIdRequired(
      partOfSpeechId,
      'partOfSpeechId'
    );

    name = await validateName(db, null, partOfSpeech.id, name);

    return db.transact(async () => {
      const {insertId: tableId} = await db.exec<InflectionTableId>`
        insert into inflection_tables (
          part_of_speech_id,
          name
        )
        values (${partOfSpeech.id}, ${name})
      `;

      await InflectionTableLayoutMut.insert(tableId, layout);

      return InflectionTable.byIdRequired(tableId);
    });
  }

  public async update(id: InflectionTableId, {
    name,
    layout,
  }: EditInflectionTableInput): Promise<InflectionTableRow> {
    const {db} = this;
    const {InflectionTable} = this.model;
    const {InflectionTableLayoutMut} = this.mut;

    const table = await InflectionTable.byIdRequired(id);

    const newFields = new FieldSet<InflectionTableRow>();
    if (name != null) {
      newFields.set(
        'name',
        await validateName(db, table.id, table.part_of_speech_id, name)
      );
    }

    if (newFields.hasValues || layout != null) {
      await db.transact(async () => {
        if (newFields.hasValues) {
          await db.exec`
            update inflection_tables
            set ${newFields}
            where id = ${table.id}
          `;
        }

        if (layout != null) {
          await InflectionTableLayoutMut.update(table.id, layout);
        }
      });
      db.clearCache(InflectionTable.byIdKey, table.id);
    }
    return InflectionTable.byIdRequired(table.id);
  }

  public async delete(id: InflectionTableId): Promise<boolean> {
    const {db} = this;

    // The table cannot be deleted while it is in use by one or
    // more definitions.
    await this.ensureUnused(id);

    const {affectedRows} = await db.exec`
      delete from inflection_tables
      where id = ${id}
    `;
    return affectedRows > 0;
  }

  private async ensureUnused(id: InflectionTableId) {
    const {Definition} = this.model;
    if (await Definition.anyUsesInflectionTable(id)) {
      throw new UserInputError(
        `Operation not permitted on table ${id} because it is used by one or more lemmas`
      );
    }
  }
}

class InflectionTableLayoutMut extends Mutator {
  public async insert(
    tableId: InflectionTableId,
    rows: InflectionTableRowInput[]
  ): Promise<void> {
    await this.createNewTableLayout(tableId, rows);
  }

  public async update(
    tableId: InflectionTableId,
    rows: InflectionTableRowInput[]
  ): Promise<void> {
    const {db} = this;
    const {InflectionTableLayout, Definition} = this.model;

    // If the current layout is used by any definition, we must create a new
    // version; otherwise, we update the existing layout. First, let's find
    // the current layout.

    const currentLayout =
      await InflectionTableLayout.currentByTableRequired(tableId);

    const needNewLayoutVersion =
      await Definition.anyUsesInflectionTableLayout(currentLayout.id);

    if (needNewLayoutVersion) {
      const layoutId = await this.createNewTableLayout(tableId, rows);

      // Ensure this table has only one current layout.
      await db.exec`
        update inflection_table_versions
        set is_current = (id = ${layoutId})
        where inflection_table_id = ${tableId}
      `;
    } else {
      await this.updateCurrentTableLayout(currentLayout, rows);
    }

    db.clearCache(InflectionTableLayout.currentByTableKey, tableId);
  }

  private async createNewTableLayout(
    tableId: InflectionTableId,
    rows: InflectionTableRowInput[]
  ): Promise<InflectionTableLayoutId> {
    const {db} = this;
    const {InflectedFormMut} = this.mut;

    // First we need to make sure there is an inflection table version.
    const {insertId: layoutId} = await db.exec<InflectionTableLayoutId>`
      insert into inflection_table_versions (inflection_table_id, is_current)
      values (${tableId}, 1)
    `;

    // Let's construct the table layout! While we walk through cells, we'll
    // simultaneously insert all the inflected forms.
    const {finalLayout, stems} = await buildTableLayout(
      rows,
      form => InflectedFormMut.insert(layoutId, form)
    );

    // And insert the layout!
    await this.db.exec`
      insert into inflection_table_layouts (
        inflection_table_version_id,
        layout,
        stems
      )
      values (
        ${layoutId},
        ${JSON.stringify(finalLayout)},
        ${JSON.stringify(stems)}
      )
    `;

    return layoutId;
  }

  private async updateCurrentTableLayout(
    layout: InflectionTableLayoutRow,
    rows: InflectionTableRowInput[]
  ): Promise<void> {
    const {db} = this;
    const {InflectedForm} = this.model;
    const {InflectedFormMut} = this.mut;

    // Fetch existing forms, so we can figure out which ones need
    // to be deleted.
    const deletedFormIds = new Set(
      (await InflectedForm.allByTableLayout(layout.id))
        .map(form => form.id)
    );

    const {finalLayout, stems} = await buildTableLayout(
      rows,
      form => {
        if (form.id) {
          // We know this form is still in the table, so let's keep it.
          if (!deletedFormIds.delete(form.id)) {
            throw new UserInputError(
              `Form ${form.id} does not belong to this table`
            );
          }
          return InflectedFormMut.update(form.id, form);
        } else {
          // Insert new form
          return InflectedFormMut.insert(layout.id, form);
        }
      }
    );

    await db.exec`
      update inflection_table_layouts
      set
        layout = ${JSON.stringify(finalLayout)},
        stems = ${JSON.stringify(stems)}
      where inflection_table_version_id = ${layout.id}
    `;

    // Delete old forms
    if (deletedFormIds.size > 0) {
      await db.exec`
        delete from inflected_forms
        where id in (${Array.from(deletedFormIds)})
      `;
    }

    db.clearCache(InflectedForm.allByTableLayoutKey, layout.id);
  }

  public async deleteObsolete(): Promise<void> {
    const {db} = this;

    // Find all layouts that are (1) not current, (2) not used by any definitions.
    // These can safely be deleted.
    const obsoleteLayouts = await db.all<{id: InflectionTableLayoutId}>`
      select itv.id
      from inflection_table_versions itv
      left join definition_inflection_tables dit on
        dit.inflection_table_version_id = itv.id
      where itv.is_current = 0
        and dit.id is null
    `;

    if (obsoleteLayouts.length > 0) {
      await db.exec`
        delete from inflection_table_versions
        where id in (${obsoleteLayouts.map(r => r.id)})
      `;
    }
  }
}

class InflectedFormMut extends Mutator {
  public async insert(
    layoutId: InflectionTableLayoutId,
    form: InflectedFormInput
  ): Promise<InflectedFormId> {
    const {db} = this;

    const fieldValues = [
      form.deriveLemma,
      form.hasCustomDisplayName,
      validateFormInflectionPattern(form.inflectionPattern),
      validateFormDisplayName(form.displayName),
    ];

    const {insertId} = await db.exec<InflectedFormId>`
      insert into inflected_forms (
        inflection_table_version_id,
        derive_lemma,
        custom_display_name,
        inflection_pattern,
        display_name
      )
      values (${layoutId}, ${fieldValues})
    `;

    return insertId;
  }

  public async update(
    id: InflectedFormId,
    form: InflectedFormInput
  ): Promise<InflectedFormId> {
    const {db} = this;
    const {InflectedForm} = this.model;

    const inflectionPattern = validateFormInflectionPattern(
      form.inflectionPattern
    );
    const displayName = validateFormDisplayName(form.displayName);

    const {affectedRows} = await db.exec`
      update inflected_forms
      set
        derive_lemma = ${form.deriveLemma},
        inflection_pattern = ${inflectionPattern},
        display_name = ${displayName}
      where id = ${id}
    `;

    if (affectedRows === 0) {
      throw new UserInputError(`Inflected form not found: ${id}`, {
        invalidArgs: ['id'],
      });
    }

    db.clearCache(InflectedForm.byIdKey, id);
    return id;
  }
}

export default {
  InflectionTableMut,
  InflectionTableLayoutMut,
  InflectedFormMut,
};
