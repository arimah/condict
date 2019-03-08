import {UserInputError} from 'apollo-server';

import Mutator from '../mutator';
import FieldSet from '../field-set';

import {
  validateName,
  validateFormInflectionPattern,
  validateFormDisplayName,
} from './validators';
import buildTableLayout, {InflectionTableRowJson} from './build-table-layout';
import ensureTableIsUnused from './ensure-unused';
import {InflectionTableRow} from './model';

export interface NewInflectionTableInput {
  partOfSpeechId: string;
  name: string;
  layout: InflectionTableRowInput[];
}

export interface EditInflectionTableInput {
  name?: string | null;
  layout?: InflectionTableRowInput[] | null;
}

export interface InflectionTableRowInput {
  cells: InflectionTableCellInput[];
}

export interface InflectionTableCellInput {
  columnSpan?: number | null;
  rowSpan?: number | null;
  headerText?: string | null;
  inflectedForm?: InflectedFormInput | null;
}

export interface InflectedFormInput {
  id?: string | null;
  deriveLemma: boolean;
  inflectionPattern: string;
  displayName: string;
  hasCustomDisplayName: boolean;
}

class InflectionTableMut extends Mutator {
  public async insert({
    partOfSpeechId,
    name,
    layout
  }: NewInflectionTableInput): Promise<InflectionTableRow> {
    const {db} = this;
    const {PartOfSpeech, InflectionTable} = this.model;
    const {InflectionTableLayoutMut, InflectedFormMut} = this.mut;

    const partOfSpeech = await PartOfSpeech.byIdRequired(
      +partOfSpeechId,
      'partOfSpeechId'
    );

    name = await validateName(db, null, partOfSpeech.id, name);

    return db.transact(async () => {
      const {insertId: tableId} = await db.exec`
        insert into inflection_tables (
          part_of_speech_id,
          name
        )
        values (${partOfSpeech.id}, ${name})
      `;

      // Let's construct the table layout! While we walk through cells, we'll
      // simultaneously insert all the inflected forms.
      const {finalLayout, stems} = await buildTableLayout(
        layout,
        form => InflectedFormMut.insert(tableId, form)
      );
      // And insert the layout!
      await InflectionTableLayoutMut.insert(tableId, finalLayout, stems);

      return InflectionTable.byIdRequired(tableId);
    });
  }

  public async update(id: number, {
    name,
    layout
  }: EditInflectionTableInput): Promise<InflectionTableRow> {
    const {db} = this;
    const {InflectionTable, InflectedForm} = this.model;
    const {InflectionTableLayoutMut, InflectedFormMut} = this.mut;

    const table = await InflectionTable.byIdRequired(id);

    // Layout edits are prohibited if the table is in use by one or
    // more definitions.
    if (layout != null) {
      await ensureTableIsUnused(db, table.id);
    }

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
          // Fetch existing forms, so we can figure out which ones need
          // to be deleted.
          const deletedFormIds = new Set(
            (await InflectedForm.allByTable(table.id))
              .map(form => form.id)
          );

          const {finalLayout, stems} = await buildTableLayout(
            layout,
            form => {
              if (form.id) {
                if (!deletedFormIds.has(+form.id)) {
                  throw new UserInputError(
                    `Form ${form.id} does not belong to this table`
                  );
                }
                // We know this form is still in the table, so let's keep it.
                deletedFormIds.delete(+form.id);
                return InflectedFormMut.update(+form.id, form);
              } else {
                // Insert new form
                return InflectedFormMut.insert(table.id, form);
              }
            }
          );
          await InflectionTableLayoutMut.update(table.id, finalLayout, stems);

          if (deletedFormIds.size > 0) {
            // Delete old forms
            await db.exec`
              delete from inflected_forms
              where id in (${Array.from(deletedFormIds)})
            `;
          }
          db.clearCache(InflectedForm.allByTableKey, table.id);
        }
      });
      db.clearCache(InflectionTable.byIdKey, table.id);
    }
    return InflectionTable.byIdRequired(table.id);
  }

  public async delete(id: number): Promise<boolean> {
    const {db} = this;

    // The table cannot be deleted while it is in use by one or
    // more definitions.
    await ensureTableIsUnused(db, id);

    const {affectedRows} = await db.exec`
      delete from inflection_tables
      where id = ${id}
    `;
    return affectedRows > 0;
  }
}

class InflectionTableLayoutMut extends Mutator {
  public async insert(
    tableId: number,
    layout: InflectionTableRowJson[],
    stems: string[]
  ): Promise<void> {
    await this.db.exec`
      insert into inflection_table_layouts (
        inflection_table_id,
        layout,
        stems
      )
      values (
        ${tableId},
        ${JSON.stringify(layout)},
        ${JSON.stringify(stems)}
      )
    `;
  }

  public async update(
    tableId: number,
    layout: InflectionTableRowJson[],
    stems: string[]
  ): Promise<void> {
    const {InflectionTableLayout} = this.model;

    this.db.clearCache(InflectionTableLayout.byTableKey, tableId);
    await this.db.exec`
      update inflection_table_layouts
      set
        layout = ${JSON.stringify(layout)},
        stems = ${JSON.stringify(stems)}
      where inflection_table_id = ${tableId}
    `;
  }
}

class InflectedFormMut extends Mutator {
  public async insert(
    tableId: number,
    form: InflectedFormInput
  ): Promise<number> {
    const {db} = this;

    const fieldValues = [
      form.deriveLemma,
      form.hasCustomDisplayName,
      validateFormInflectionPattern(form.inflectionPattern),
      validateFormDisplayName(form.displayName),
    ];

    const {insertId} = await db.exec`
      insert into inflected_forms (
        inflection_table_id,
        derive_lemma,
        custom_display_name,
        inflection_pattern,
        display_name
      )
      values (${tableId}, ${fieldValues})
    `;

    return insertId;
  }

  public async update(id: number, form: InflectedFormInput): Promise<number> {
    const {db} = this;
    const {InflectedForm} = this.model;

    const existingForm = await InflectedForm.byIdRequired(id);

    const [
      inflectionPattern,
      displayName
    ] = [
      validateFormInflectionPattern(form.inflectionPattern),
      validateFormDisplayName(form.displayName),
    ];

    await db.exec`
      update inflected_forms
      set
        derive_lemma = ${form.deriveLemma},
        inflection_pattern = ${inflectionPattern},
        display_name = ${displayName}
      where id = ${existingForm.id}
    `;
    db.clearCache(InflectedForm.byIdKey, existingForm.id);
    return existingForm.id;
  }
}

export default {
  InflectionTableMut,
  InflectionTableLayoutMut,
  InflectedFormMut,
};
