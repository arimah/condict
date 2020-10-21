import {UserInputError} from 'apollo-server';

import {Connection} from '../../database';
import {
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  NewInflectionTableInput,
  EditInflectionTableInput,
  InflectionTableRowInput,
  InflectedFormInput,
} from '../../graphql';

import {Definition} from '../definition';
import {PartOfSpeech} from '../part-of-speech';
import FieldSet from '../field-set';

import {InflectionTable, InflectionTableLayout, InflectedForm} from './model';
import {
  validateName,
  validateFormInflectionPattern,
  validateFormDisplayName,
} from './validators';
import buildTableLayout from './build-table-layout';
import {InflectionTableRow, InflectionTableLayoutRow} from './types';

const InflectionTableMut = {
  async insert(
    db: Connection,
    data: NewInflectionTableInput
  ): Promise<InflectionTableRow> {
    const {partOfSpeechId, layout} = data;
    let {name} = data;

    const partOfSpeech = await PartOfSpeech.byIdRequired(
      db,
      partOfSpeechId,
      'partOfSpeechId'
    );

    name = validateName(db, null, partOfSpeech.id, name);

    return db.transact(() => {
      const {insertId: tableId} = db.exec<InflectionTableId>`
        insert into inflection_tables (
          part_of_speech_id,
          name
        )
        values (${partOfSpeech.id}, ${name})
      `;

      InflectionTableLayoutMut.insert(db, tableId, layout);

      return InflectionTable.byIdRequired(db, tableId);
    });
  },

  async update(
    db: Connection,
    id: InflectionTableId,
    data: EditInflectionTableInput
  ): Promise<InflectionTableRow> {
    const {name, layout} = data;

    const table = await InflectionTable.byIdRequired(db, id);

    const newFields = new FieldSet<InflectionTableRow>();
    if (name != null) {
      newFields.set(
        'name',
        validateName(db, table.id, table.part_of_speech_id, name)
      );
    }

    if (newFields.hasValues || layout != null) {
      await db.transact(async () => {
        if (newFields.hasValues) {
          db.exec`
            update inflection_tables
            set ${newFields}
            where id = ${table.id}
          `;
        }

        if (layout != null) {
          await InflectionTableLayoutMut.update(db, table.id, layout);
        }
      });
      db.clearCache(InflectionTable.byIdKey, table.id);
    }
    return InflectionTable.byIdRequired(db, table.id);
  },

  delete(db: Connection, id: InflectionTableId): boolean {
    // The table cannot be deleted while it is in use by one or
    // more definitions.
    this.ensureUnused(db, id);

    const {affectedRows} = db.exec`
      delete from inflection_tables
      where id = ${id}
    `;
    return affectedRows > 0;
  },

  ensureUnused(db: Connection, id: InflectionTableId): void {
    if (Definition.anyUsesInflectionTable(db, id)) {
      throw new UserInputError(
        `Operation not permitted on table ${
          id
        } because it is used by one or more lemmas`
      );
    }
  },
} as const;

const InflectionTableLayoutMut = {
  insert(
    db: Connection,
    tableId: InflectionTableId,
    rows: InflectionTableRowInput[]
  ): void {
    this.createNewTableLayout(db, tableId, rows);
  },

  async update(
    db: Connection,
    tableId: InflectionTableId,
    rows: InflectionTableRowInput[]
  ): Promise<void> {
    // If the current layout is used by any definition, we must create a new
    // version; otherwise, we update the existing layout. First, let's find
    // the current layout.

    const currentLayout =
      await InflectionTableLayout.currentByTableRequired(db, tableId);

    const needNewLayoutVersion =
      Definition.anyUsesInflectionTableLayout(db, currentLayout.id);

    if (needNewLayoutVersion) {
      const layoutId = this.createNewTableLayout(db, tableId, rows);

      // Ensure this table has only one current layout.
      db.exec`
        update inflection_table_versions
        set is_current = (id = ${layoutId})
        where inflection_table_id = ${tableId}
      `;
    } else {
      await this.updateCurrentTableLayout(db, currentLayout, rows);
    }

    db.clearCache(InflectionTableLayout.currentByTableKey, tableId);
  },

  createNewTableLayout(
    db: Connection,
    tableId: InflectionTableId,
    rows: InflectionTableRowInput[]
  ): InflectionTableLayoutId {
    // First we need to make sure there is an inflection table version.
    const {insertId: layoutId} = db.exec<InflectionTableLayoutId>`
      insert into inflection_table_versions (inflection_table_id, is_current)
      values (${tableId}, 1)
    `;

    // Let's construct the table layout! While we walk through cells, we'll
    // simultaneously insert all the inflected forms.
    const {finalLayout, stems} = buildTableLayout(
      rows,
      form => InflectedFormMut.insert(db, layoutId, form)
    );

    // And insert the layout!
    db.exec`
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
  },

  async updateCurrentTableLayout(
    db: Connection,
    layout: InflectionTableLayoutRow,
    rows: InflectionTableRowInput[]
  ): Promise<void> {
    // Fetch existing forms, so we can figure out which ones need
    // to be deleted.
    const deletedFormIds = new Set(
      (await InflectedForm.allByTableLayout(db, layout.id))
        .map(form => form.id)
    );

    const {finalLayout, stems} = buildTableLayout(
      rows,
      form => {
        if (form.id) {
          // We know this form is still in the table, so let's keep it.
          if (!deletedFormIds.delete(form.id)) {
            throw new UserInputError(
              `Form ${form.id} does not belong to this table`
            );
          }
          return InflectedFormMut.update(db, form.id, form);
        } else {
          // Insert new form
          return InflectedFormMut.insert(db, layout.id, form);
        }
      }
    );

    db.exec`
      update inflection_table_layouts
      set
        layout = ${JSON.stringify(finalLayout)},
        stems = ${JSON.stringify(stems)}
      where inflection_table_version_id = ${layout.id}
    `;

    // Delete old forms
    if (deletedFormIds.size > 0) {
      db.exec`
        delete from inflected_forms
        where id in (${Array.from(deletedFormIds)})
      `;
    }

    db.clearCache(InflectedForm.allByTableLayoutKey, layout.id);
  },

  deleteObsolete(db: Connection): void {
    // Find all layouts that are (1) not current, (2) not used by any definitions.
    // These can safely be deleted.
    const obsoleteLayouts = db.all<{id: InflectionTableLayoutId}>`
      select itv.id
      from inflection_table_versions itv
      left join definition_inflection_tables dit on
        dit.inflection_table_version_id = itv.id
      where itv.is_current = 0
        and dit.id is null
    `;

    if (obsoleteLayouts.length > 0) {
      db.exec`
        delete from inflection_table_versions
        where id in (${obsoleteLayouts.map(r => r.id)})
      `;
    }
  },
} as const;

const InflectedFormMut = {
  insert(
    db: Connection,
    layoutId: InflectionTableLayoutId,
    form: InflectedFormInput
  ): InflectedFormId {
    const {insertId} = db.exec<InflectedFormId>`
      insert into inflected_forms (
        inflection_table_version_id,
        derive_lemma,
        custom_display_name,
        inflection_pattern,
        display_name
      )
      values (
        ${layoutId},
        ${form.deriveLemma},
        ${form.hasCustomDisplayName},
        ${validateFormInflectionPattern(form.inflectionPattern)},
        ${validateFormDisplayName(form.displayName)}
      )
    `;

    return insertId;
  },

  update(
    db: Connection,
    id: InflectedFormId,
    form: InflectedFormInput
  ): InflectedFormId {
    const inflectionPattern = validateFormInflectionPattern(
      form.inflectionPattern
    );
    const displayName = validateFormDisplayName(form.displayName);

    const {affectedRows} = db.exec`
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
  },
} as const;

export {
  InflectionTableMut,
  InflectionTableLayoutMut,
  InflectedFormMut,
};
