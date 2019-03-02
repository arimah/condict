const {UserInputError} = require('apollo-server');

const Mutator = require('../mutator');
const FieldSet = require('../field-set');

const {
  validateName,
  validateFormInflectionPattern,
  validateFormDisplayName,
} = require('./validators');
const buildTableLayout = require('./build-table-layout');
const ensureTableIsUnused = require('./ensure-unused');

class InflectionTableMut extends Mutator {
  async insert({
    partOfSpeechId,
    name,
    layout
  }) {
    const {db} = this;
    const {PartOfSpeech, InflectionTable} = this.model;
    const {InflectionTableLayoutMut, InflectedFormMut} = this.mut;

    const partOfSpeech = await PartOfSpeech.byIdRequired(
      partOfSpeechId,
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

      return InflectionTable.byId(tableId);
    });
  }

  async update(id, {
    name,
    layout
  }) {
    const {db} = this;
    const {InflectionTable, InflectedForm} = this.model;
    const {InflectionTableLayoutMut, InflectedFormMut} = this.mut;

    const table = await InflectionTable.byIdRequired(id);

    // Layout edits are prohibited if the table is in use by one or
    // more definitions.
    if (layout != null) {
      await ensureTableIsUnused(db, table.id);
    }

    const newFields = new FieldSet();
    if (name != null) {
      newFields.set(
        'name',
        await validateName(db, id, table.part_of_speech_id, name)
      );
    }

    if (newFields.size > 0 || layout != null) {
      await db.transact(async () => {
        if (layout != null) {
          // Fetch existing forms, so we can figure out which ones need
          // to be deleted.
          const deletedFormIds = new Set(
            (await InflectedForm.allByTable(id))
              .map(form => form.id)
          );

          const {finalLayout, stems} = await buildTableLayout(
            layout,
            form => {
              if (form.id) {
                if (!deletedFormIds.has(form.id | 0)) {
                  throw new UserInputError(
                    `Form ${form.id} does not belong to this table`
                  );
                }
                // We know this form is still in the table, so let's keep it.
                deletedFormIds.delete(form.id | 0);
                return InflectedFormMut.update(form.id, form);
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

        if (newFields.size > 0) {
          await db.exec`
            update inflection_tables
            set ${newFields}
            where id = ${table.id}
          `;
        }
      });
      db.clearCache(InflectionTable.byIdKey, table.id);
    }
    return InflectionTable.byId(id);
  }

  async delete(id) {
    const {db} = this;

    // The table cannot be deleted while it is in use by one or
    // more definitions.
    await ensureTableIsUnused(db, id);

    const {affectedRows} = await db.exec`
      delete from inflection_tables
      where id = ${id | 0}
    `;
    return affectedRows > 0;
  }
}

class InflectionTableLayoutMut extends Mutator {
  insert(tableId, layout, stems) {
    return this.db.exec`
      insert into inflection_table_layouts (
        inflection_table_id,
        layout,
        stems
      )
      values (
        ${tableId | 0},
        ${JSON.stringify(layout)},
        ${JSON.stringify(stems)}
      )
    `;
  }

  update(tableId, layout, stems) {
    const {InflectionTableLayout} = this.model;

    this.db.clearCache(InflectionTableLayout.byTableKey, tableId | 0);
    return this.db.exec`
      update inflection_table_layouts
      set
        layout = ${JSON.stringify(layout)},
        stems = ${JSON.stringify(stems)}
      where inflection_table_id = ${tableId | 0}
    `;
  }
}

class InflectedFormMut extends Mutator {
  async insert(tableId, form) {
    const {db} = this;

    const fieldValues = [
      form.deriveLemma,
      validateFormInflectionPattern(form.inflectionPattern),
      validateFormDisplayName(form.displayName),
    ];

    const {insertId} = await db.exec`
      insert into inflected_forms (
        inflection_table_id,
        derive_lemma,
        inflection_pattern,
        display_name
      )
      values (${tableId}, ${fieldValues})
    `;

    return insertId;
  }

  async update(id, form) {
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

module.exports = {
  InflectionTableMut,
  InflectionTableLayoutMut,
  InflectedFormMut,
};
