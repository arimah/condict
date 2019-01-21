const {UserInputError} = require('apollo-server');

const Mutator = require('../mutator');
const validator = require('../validator');
const FieldSet = require('../field-set');

const nameValidator = (db, currentId, partOfSpeechId) =>
  validator('name')
    .map(value => value.trim())
    .lengthBetween(1, 64)
    .unique(
      currentId,
      name =>
        db.get`
          select id
          from inflection_tables
          where name = ${name}
            and part_of_speech_id = ${partOfSpeechId}
        `,
      name => `the part of speech already has a table named '${name}'`
    );

const formDeriveLemmaValidator =
  validator('deriveLemma')
    .map(value => {
      switch (value) {
        case true: return true;
        case false: return false;
        default: throw new Error(`Invalid deriveLemma value: ${value}`);
      }
    });

const formInflectionPatternValidator =
  validator('inflectionPattern')
    .map(value => value.trim())
    .lengthBetween(0, 64);

const formDisplayNameValidator =
  validator('displayName')
    .map(value => value.trim())
    .lengthBetween(0, 96);

const buildTableLayout = async (layout, handleInflectedForm) => {
  const finalLayout = [];

  // I would love to use .map() here, but it's not really compatible with
  // async/await, and I can't be bothered to hand-roll my own .mapAsync().
  for (const row of layout) {
    const cells = [];

    for (const cell of row.cells) {
      const layoutCell = {};

      // It's rare for cells to span more than one column or row, so only
      // store the column and row span if necessary. Defaults to 1 otherwise.
      if (cell.columnSpan > 1) {
        layoutCell.columnSpan = cell.columnSpan;
      }
      if (cell.rowSpan > 1) {
        layoutCell.rowSpan = cell.rowSpan;
      }

      if (cell.headerText != null) {
        layoutCell.headerText = cell.headerText.trim();
      } else if (cell.inflectedForm != null) {
        // This is a data cell! Let handleInflectedForm() deal with it.
        // We expect it to return the inflected form ID.
        layoutCell.inflectedFormId = await handleInflectedForm(
          cell.inflectedForm
        );
      } else {
        throw new UserInputError(
          `Cell must have either 'headerText' or 'inflectedForm'`
        );
      }

      cells.push(layoutCell);
    }

    finalLayout.push({cells});
  }

  return finalLayout;
};

const ensureTableIsUnused = async (db, id) => {
  const {used} = await db.get`
    select exists (
      select 1
      from definition_inflection_tables dit
      inner join definitions d on d.id = dit.definition_id
      where dit.inflection_table_id = ${id | 0}
      limit 1
    ) as used
  `;
  if (used) {
    throw new UserInputError(
      `Operation not permitted on table ${id} because it is used by one or more lemmas`
    );
  }
};

class InflectionTableMut extends Mutator {
  async insert({
    partOfSpeechId,
    name,
    layout
  }) {
    const {db} = this;
    const {PartOfSpeech, InflectionTable} = this.model;
    const {InflectionTableLayoutMut, InflectedFormMut} = this.mut;

    const partOfSpeech = await PartOfSpeech.byId(partOfSpeechId);
    if (partOfSpeech == null) {
      throw new UserInputError(`Part of speech not found: ${partOfSpeechId}`, {
        invalidArgs: ['partOfSpeechId'],
      });
    }

    name = await nameValidator(db, null, partOfSpeech.id).validate(name);

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
      const finalLayout = await buildTableLayout(
        layout,
        form => InflectedFormMut.insert(tableId, form)
      );
      // And insert the layout!
      await InflectionTableLayoutMut.insert(tableId, finalLayout);

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

    const table = await InflectionTable.byId(id);
    if (table == null) {
      throw new UserInputError(`Inflection table not found: ${id}`, {
        invalidArgs: ['id'],
      });
    }

    // Layout edits are prohibited if the table is in use by one or
    // more definitions.
    if (layout != null) {
      await ensureTableIsUnused(db, table.id);
    }

    const newFields = new FieldSet();
    if (name != null) {
      newFields.set(
        'name',
        await nameValidator(db, id, table.part_of_speech_id).validate(name)
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

          const finalLayout = await buildTableLayout(
            layout,
            form => {
              if (form.id) {
                // We know this form is still in the table, so let's keep it.
                deletedFormIds.delete(form.id | 0);
                return InflectedFormMut.update(form.id, form);
              } else {
                // Insert new form
                return InflectedFormMut.insert(table.id, form);
              }
            }
          );
          await InflectionTableLayoutMut.update(table.id, finalLayout);

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
  insert(tableId, layout) {
    return this.db.exec`
      insert into inflection_table_layouts (inflection_table_id, layout)
      values (${tableId | 0}, ${JSON.stringify(layout)})
    `;
  }

  update(tableId, layout) {
    const {InflectionTableLayout} = this.model;

    this.db.clearCache(InflectionTableLayout.rawByTableKey, tableId | 0);
    return this.db.exec`
      update inflection_table_layouts
      set layout = ${JSON.stringify(layout)}
      where inflection_table_id = ${tableId | 0}
    `;
  }
}

class InflectedFormMut extends Mutator {
  async insert(tableId, form) {
    const {db} = this;

    const fieldValues = [
      formDeriveLemmaValidator.validate(form.deriveLemma),
      formInflectionPatternValidator.validate(form.inflectionPattern),
      formDisplayNameValidator.validate(form.displayName),
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

    const existingForm = await InflectedForm.byId(id);
    if (!existingForm) {
      throw new UserInputError(`Inflected form not found: ${id}`);
    }

    const [
      deriveLemma,
      inflectionPattern,
      displayName
    ] = [
      formDeriveLemmaValidator.validate(form.deriveLemma),
      formInflectionPatternValidator.validate(form.inflectionPattern),
      formDisplayNameValidator.validate(form.displayName),
    ];

    await db.exec`
      update inflected_forms
      set
        derive_lemma = ${deriveLemma},
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
