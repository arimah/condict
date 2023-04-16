import {DataReader, DataWriter} from '../../database';
import {
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
  NewInflectionTableInput,
  EditInflectionTableInput,
  InflectionTableRowInput,
  InflectedFormInput,
  LanguageId,
} from '../../graphql';
import {UserInputError} from '../../errors';

import {Definition} from '../definition';
import {Language} from '../language';
import FieldSet from '../field-set';
import {MutContext, WriteContext} from '../types';

import {InflectionTable, InflectionTableLayout, InflectedForm} from './model';
import {
  validateName,
  validateFormInflectionPattern,
  validateFormDisplayName,
} from './validators';
import buildTableLayout from './build-table-layout';
import {
  InflectionTableRow,
  InflectionTableLayoutRow,
  InflectedFormRow,
} from './types';

const InflectionTableMut = {
  async insert(
    context: MutContext,
    data: NewInflectionTableInput
  ): Promise<InflectionTableRow> {
    const {languageId, layout} = data;
    let {name} = data;

    const language = await Language.byIdRequired(
      context.db,
      languageId,
      'languageId'
    );

    name = validateName(context.db, null, language.id, name);

    return MutContext.transact(context, context => {
      const {db, events, logger} = context;
      const now = Date.now();
      const {insertId: tableId} = db.exec<InflectionTableId>`
        insert into inflection_tables (
          language_id,
          name,
          time_created,
          time_updated
        )
        values (${language.id}, ${name}, ${now}, ${now})
      `;

      InflectionTableLayoutMut.insert(db, tableId, layout);

      events.emit({
        type: 'inflectionTable',
        action: 'create',
        id: tableId,
        languageId: language.id,
      });
      logger.verbose(`Created inflection table: ${tableId}`);

      return InflectionTable.byIdRequired(db, tableId);
    });
  },

  async update(
    context: MutContext,
    id: InflectionTableId,
    data: EditInflectionTableInput
  ): Promise<InflectionTableRow> {
    const {name, layout} = data;
    const {db} = context;

    const table = await InflectionTable.byIdRequired(db, id);

    const newFields = new FieldSet<InflectionTableRow>();
    if (name != null) {
      newFields.set(
        'name',
        validateName(db, table.id, table.language_id, name)
      );
    }

    if (newFields.hasValues || layout != null) {
      await MutContext.transact(context, async context => {
        const {db, events, logger} = context;
        newFields.set('time_updated', Date.now());

        db.exec`
          update inflection_tables
          set ${newFields}
          where id = ${table.id}
        `;

        if (layout != null) {
          await InflectionTableLayoutMut.update(context, table.id, layout);
        }

        events.emit({
          type: 'inflectionTable',
          action: 'update',
          id: table.id,
          languageId: table.language_id,
        });
        logger.verbose(`Updated inflection table: ${table.id}`);
      });

      db.clearCache(InflectionTable.byIdKey, table.id);
    }
    return InflectionTable.byIdRequired(db, table.id);
  },

  async delete(context: MutContext, id: InflectionTableId): Promise<boolean> {
    const {db} = context;
    const table = await InflectionTable.byIdRequired(db, id);
    if (!table) {
      return false;
    }

    // The table cannot be deleted while it is in use by one or
    // more definitions.
    this.ensureUnused(db, table.id);

    await MutContext.transact(context, context => {
      const {db, events, logger} = context;
      db.exec`
        delete from inflection_tables
        where id = ${id}
      `;

      events.emit({
        type: 'inflectionTable',
        action: 'delete',
        id: table.id,
        languageId: table.language_id,
      });
      logger.verbose(`Deleted inflection table: ${table.id}`);
    });

    db.clearCache(InflectionTable.byIdKey, table.id);
    return true;
  },

  ensureUnused(db: DataReader, id: InflectionTableId): void {
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
    db: DataWriter,
    tableId: InflectionTableId,
    rows: InflectionTableRowInput[]
  ): void {
    this.createNewTableLayout(db, tableId, rows);
  },

  async update(
    context: WriteContext,
    tableId: InflectionTableId,
    rows: InflectionTableRowInput[]
  ): Promise<void> {
    // If the current layout is used by any definition, we must create a new
    // version; otherwise, we update the existing layout. First, let's find
    // the current layout.
    const {db, logger} = context;

    const currentLayout =
      await InflectionTableLayout.currentByTableRequired(db, tableId);
    const currentForms = await InflectedForm.allByTableLayout(
      db,
      currentLayout.id
    );

    if (this.needsNewVersion(db, currentLayout, currentForms, rows)) {
      const layoutId = this.createNewTableLayout(db, tableId, rows);

      // Ensure this table has only one current layout.
      db.exec`
        update inflection_table_versions
        set is_current = (id = ${layoutId})
        where inflection_table_id = ${tableId}
      `;
      logger.debug('Created new table layout: previous is still in use');
    } else {
      this.updateCurrentTableLayout(db, currentLayout, currentForms, rows);
      logger.debug('Updated current table layout');
    }

    db.clearCache(InflectionTableLayout.currentByTableKey, tableId);
  },

  createNewTableLayout(
    db: DataWriter,
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

  updateCurrentTableLayout(
    db: DataWriter,
    layout: InflectionTableLayoutRow,
    prevForms: InflectedFormRow[],
    rows: InflectionTableRowInput[]
  ): void {
    // Fetch existing forms, so we can figure out which ones need
    // to be deleted.
    const deletedFormIds = new Set(prevForms.map(form => form.id));

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

  deleteObsolete(context: WriteContext): void {
    const {db, events, logger} = context;

    // Find all layouts that are (1) not current, (2) not used by any definitions.
    // These can safely be deleted.
    const deleted = db.all<{inflection_table_id: InflectionTableId}>`
      with obsolete_layouts(id) as (
        select itv.id
        from inflection_table_versions itv
        left join definition_inflection_tables dit on
          dit.inflection_table_version_id = itv.id
        where itv.is_current = 0
          and dit.id is null
      )
      delete from inflection_table_versions
      where id in (select id from obsolete_layouts)
      returning inflection_table_id
    `;
    if (deleted.length > 0) {
      type Row = {
        id: InflectionTableId;
        language_id: LanguageId;
      };
      // We must now emit an update event on every inflection table that was
      // affected by this mass-delete.
      const tableIds = Array.from(
        new Set(deleted.map(d => d.inflection_table_id))
      );

      // To prevent an excess of database calls and promises, let's fetch the
      // necessary data in a custom query right here.
      const updated = db.all<Row>`
        select
          it.id as id,
          it.language_id as language_id
        from inflection_tables it
        where it.id in (${tableIds})
      `;

      for (const row of updated) {
        events.emit({
          type: 'inflectionTable',
          action: 'update',
          id: row.id,
          languageId: row.language_id,
        });
      }

      logger.debug(`Deleted obsolete table layouts: count = ${updated.length}`);
    }
  },

  needsNewVersion(
    db: DataReader,
    currentLayout: InflectionTableLayoutRow,
    currentForms: InflectedFormRow[],
    newRows: InflectionTableRowInput[]
  ): boolean {
    // The basic idea is this: if the user has changed the table in a way that
    // would require derived definitions to be recomputed, then we need a new
    // layout version. Changes to header cells, form names, and layout changes
    // such as changing row and column spans do not necessitate a new version.

    if (!Definition.anyUsesInflectionTableLayout(db, currentLayout.id)) {
      // If no definition uses the current layout, we can safely replace it.
      return false;
    }

    // This map contains forms that do not appear in newRows.
    // That is, deleted forms.
    const deletedForms = new Map(currentForms.map(form => [form.id, form]));

    for (const row of newRows) {
      for (const cell of row.cells) {
        const form = cell.inflectedForm;
        if (!form) {
          continue;
        }

        if (form.id != null) {
          // Existing inflected form.
          const existingForm = deletedForms.get(form.id);
          deletedForms.delete(form.id);
          if (!existingForm) {
            throw new Error(`Form ${form.id} does not belong to this table`);
          }

          if (
            // If we've either gone to or from deriving a definition, something
            // would have to be recomputed.
            (existingForm.derive_lemma === 1) !== form.deriveLemma ||
            // If the inflection pattern has changed, derived definitions would
            // need to be recomputed.
            form.deriveLemma &&
            form.inflectionPattern !== existingForm.inflection_pattern
          ) {
            return true;
          }
        } else if (form.deriveLemma) {
          // New inflected form that needs a definition derived from it.
          return true;
        }
      }
    }

    for (const form of deletedForms.values()) {
      if (form.derive_lemma) {
        // The definitions derived from this form would have to be deleted, so
        // we need a new layout version.
        return true;
      }
    }

    return false;
  },
} as const;

const InflectedFormMut = {
  insert(
    db: DataWriter,
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
    db: DataWriter,
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
        custom_display_name = ${form.hasCustomDisplayName},
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
