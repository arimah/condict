import {InflectionTableRowJson} from '../../model/inflection-table/types';
import {BlockElementJson} from '../../rich-text/types';

import {TableSchema, ColumnSchema, ColumnType, Collation} from './types';
import {inlineElementReferences, updateInlineReferences} from './inline-refs';

export const schemaVersion = 1;

// When making changes to the schema, the following invariants MUST hold:
//
// 1. If a table has a column named `id`, it must be the primary key, and no
//    other column can be in the primary key.
// 2. Any column named `id` must also be auto-incremented.
//
// The exporter relies on this. Moreover, some databases (e.g. SQLite) have no
// support for auto-incremented columns that are not the sole PK.
//
// Use the shorthand object defined literally right below this comment if you
// need an `id` column.

// A shorthand object for the `id` column. This does not automagically become
// the primary key; don't forget to set `primaryKey`!
const id: ColumnSchema = {
  name: 'id',
  comment: 'The row ID.',
  type: ColumnType.ID,
  autoIncrement: true,
};

const tables: TableSchema[] = [
  {
    name: 'schema_info',
    comment: 'Schema metadata.',
    columns: [
      {
        name: 'name',
        comment: 'The metadata key.',
        type: ColumnType.VARCHAR,
        size: 32,
        collate: Collation.BINARY
      },
      {
        name: 'value',
        comment: 'The metadata value.',
        type: ColumnType.VARCHAR,
        size: 32,
        collate: Collation.BINARY
      },
    ],
    primaryKey: 'name',
    skipExport: true,
  },

  {
    name: 'languages',
    comment: 'Languages that are defined in the dictionary.',
    columns: [
      id,
      {
        name: 'lemma_count',
        comment: 'The total number of lemmas in the language. Cached for performance.',
        type: ColumnType.UNSIGNED_INT,
        size: 32,
        default: 0,
      },
      {
        name: 'name',
        comment: 'The full display name of the language.',
        type: ColumnType.VARCHAR,
        size: 96,
      },
      {
        name: 'url_name',
        comment: 'The name of the language as displayed in the URL. Limited in length to ensure the URL is of a reasonable size.',
        type: ColumnType.VARCHAR,
        size: 32,
        collate: Collation.BINARY,
      },
    ],
    primaryKey: 'id',
    unique: [
      'name',
      'url_name'
    ],
    async preImport(db, row) {
      interface Status {
        name_taken: number;
        url_name_taken: number;
      }
      const result = await db.getRequired<Status>`
        select
          exists (
            select 1
            from languages
            where name = ${row.name}
          ) as name_taken,
          exists (
            select 1
            from languages
            where url_name = ${row.url_name}
          ) as url_name_taken
      `;
      if (result.name_taken === 1) {
        throw new Error(
          `Cannot continue import: there is already a language named '${row.name}'`
        );
      }
      if (result.url_name_taken === 1) {
        throw new Error(
          `Cannot continue import: there is already a language with the URL name '${row.url_name}'`
        );
      }
    },
  },

  {
    name: 'parts_of_speech',
    comment: 'Parts of speech defined for a language. A part of speech is associated with every definition, and can define any number of inflection tables.',
    columns: [
      id,
      {
        name: 'language_id',
        comment: 'The language that the part of speech belongs to.',
        references: {
          table: 'languages',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'name',
        comment: 'The display name of the part of speech.',
        type: ColumnType.VARCHAR,
        size: 96,
      },
    ],
    primaryKey: 'id',
    unique: [
      ['language_id', 'name'],
    ],
    index: [
      'language_id',
    ],
  },

  {
    name: 'inflection_tables',
    comment: 'Inflection tables for each part of speech.',
    columns: [
      id,
      {
        name: 'part_of_speech_id',
        comment: 'The parent part of speech.',
        references: {
          table: 'parts_of_speech',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'name',
        comment: 'The name of the inflection table, shown in admin UIs.',
        type: ColumnType.VARCHAR,
        size: 64,
      },
    ],
    primaryKey: 'id',
    unique: [
      ['part_of_speech_id', 'name'],
    ],
    index: [
      'part_of_speech_id',
    ],
  },

  {
    name: 'inflected_forms',
    comment: 'Individual cells in an inflection table, which correspond to single inflected forms. The position of a cell is determined by the layout of the inflection table.',
    columns: [
      id,
      {
        name: 'inflection_table_id',
        comment: 'The parent inflection table.',
        references: {
          table: 'inflection_tables',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'derive_lemma',
        comment: 'Determines whether the inflected form, once computed for a definition, should be added as a separate lemma.',
        type: ColumnType.BOOLEAN,
        default: true,
      },
      {
        name: 'custom_display_name',
        comment: 'Determines whether the `display_name` was entered specifically by the user, or derived automatically from the header cells in the containing table.',
        type: ColumnType.BOOLEAN,
        default: false,
      },
      {
        name: 'inflection_pattern',
        comment: "A pattern, such as '{~}s', which describes how to construct the inflected form. Placeholders are replaced by the lemma form and/or custom stems defined for the definition.",
        type: ColumnType.VARCHAR,
        size: 64,
      },
      {
        name: 'display_name',
        comment: "The display name of the inflected form, which is usually derived from the cell's position in its table, and may be edited by the user.",
        type: ColumnType.VARCHAR,
        size: 96,
      },
    ],
    primaryKey: 'id',
    index: [
      'inflection_table_id',
    ],
  },

  {
    name: 'inflection_table_layouts',
    comment: "Layouts for all inflected tables. This is a separate table for two reasons: it means we don't have to fetch a potentially large JSON object unless the layout is asked for, and it means we can actually reference `inflected_forms` in each cell so the data export/import works.",
    columns: [
      {
        name: 'inflection_table_id',
        comment: 'The parent inflection table.',
        references: {
          table: 'inflection_tables',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'layout',
        comment: 'A JSON object that describes the layout of the table. See app documentation for details.',
        type: ColumnType.JSON,
        contentReferences: [
          {
            table: 'inflected_forms',
            column: 'id',
          },
        ],
        export(value, {inflected_forms: newFormIds}) {
          const rows = JSON.parse(value) as InflectionTableRowJson[];
          rows.forEach(({cells}) => {
            cells.forEach(cell => {
              if (cell.inflectedFormId) {
                cell.inflectedFormId = newFormIds.get(cell.inflectedFormId);
              }
            });
          });
          // Return the raw JSON object; we're encoding this as JSON anyway.
          return rows;
        },
        import(value, {inflected_forms: newFormIds}) {
          // It's okay to mutate the value here, no need to make a copy.
          const rows = value as InflectionTableRowJson[];
          rows.forEach(({cells}) => {
            cells.forEach(cell => {
              if (cell.inflectedFormId != null) {
                cell.inflectedFormId = newFormIds.get(cell.inflectedFormId);
              }
            });
          });
          // Don't forget to serialize it as JSON!
          return JSON.stringify(rows);
        },
      },
      {
        name: 'stems',
        comment: "A JSON array that contains the unique stem names present in the table layout. This is calculated when the layout is updated, and is stored here primarily for performance reasons (so we don't have to walk the table and parse inflection patterns in the admin UI).",
        type: ColumnType.JSON,
        // We can export this as a JSON object, since it's a JSON column.
        export: value => JSON.parse(value),
        // Mustn't forget to import it as JSON though.
        import: value => JSON.stringify(value),
      },
    ],
    primaryKey: 'inflection_table_id',
  },

  {
    name: 'lemmas',
    comment: 'The lemmas of the dictionary; the words that are listed and looked up. Each lemma may have zero or more regular definitions (see `definitions`) and zero or more derived definitions (see `derived_definitions`), but must have at least one of either kind.',
    columns: [
      id,
      {
        name: 'language_id',
        comment: 'The language that the lemma belongs to.',
        references: {
          table: 'languages',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'term_unique',
        comment: 'The term being defined. This field uses binary collation, for "correct" uniqueness (we want accented letters to be distinct from their non-accented counterparts, and case matters). This value must be equal to `term_display`.',
        type: ColumnType.VARCHAR,
        size: 160,
        collate: Collation.BINARY,
      },
      {
        name: 'term_display',
        comment: 'The term being defined. This field uses the default Unicode collation, for quick sorting. This value must be equal to `term_unique`.',
        type: ColumnType.VARCHAR,
        size: 160,
      },
    ],
    primaryKey: 'id',
    unique: [
      ['language_id', 'term_unique'],
    ],
    index: [
      'language_id',
      'term_display',
    ],
  },

  {
    name: 'definitions',
    comment: 'Definitions attached to a single lemma. A lemma may have multiple definitions, and can also include forms that are derived by inflecting a definition from this table (see `derived_definitions`).',
    columns: [
      id,
      {
        name: 'lemma_id',
        comment: 'The lemma that this definition belongs to.',
        references: {
          table: 'lemmas',
          column: 'id',
        },
      },
      {
        name: 'language_id',
        comment: 'The language that the definition belongs to.',
        references: {
          table: 'languages',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'part_of_speech_id',
        comment: 'The part of speech of the definition.',
        references: {
          table: 'parts_of_speech',
          column: 'id',
        },
      },
    ],
    primaryKey: 'id',
    index: [
      'lemma_id',
      'language_id',
      'part_of_speech_id'
    ],
  },

  {
    name: 'definition_descriptions',
    comment: 'Descriptions associated with each definition. This is a separate table for two reasons: it means we don\'t have to fetch a potentially large JSON object unless the description is asked for, and it means we can actually reference `definitions` in the formatted text so the data export/import works.',
    columns: [
      {
        name: 'definition_id',
        comment: 'The definition that this description belongs to.',
        references: {
          table: 'definitions',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'description',
        comment: 'The definition text itself. See app documentation for details.',
        type: ColumnType.JSON,
        export(value, newIds) {
          const blocks = JSON.parse(value) as BlockElementJson[];
          blocks.forEach(block => updateInlineReferences(block.inlines, newIds));
          return blocks;
        },
        import(blocks, newIds) {
          (blocks as BlockElementJson[]).forEach(block =>
            updateInlineReferences(block.inlines, newIds)
          );
          return JSON.stringify(blocks);
        },
        contentReferences: [
          ...inlineElementReferences,
        ],
      },
    ],
    primaryKey: 'definition_id',
  },

  {
    name: 'definition_stems',
    comment: 'Inflection stems for individual definitions.',
    columns: [
      {
        name: 'definition_id',
        comment: 'The definition that this stem belongs to.',
        references: {
          table: 'definitions',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'name',
        comment: 'The name (key) of the stem.',
        type: ColumnType.VARCHAR,
        size: 32,
      },
      {
        name: 'value',
        comment: 'The value of the stem.',
        type: ColumnType.VARCHAR,
        size: 160,
      },
    ],
    primaryKey: ['definition_id', 'name'],
    index: [
      'definition_id',
    ],
  },

  {
    name: 'definition_inflection_tables',
    comment: 'Specifies which inflection tables a definition uses. Within a single definition, the same inflection_table_id may occur multiple times: sometimes a word has different inflected forms depending on context or usage.',
    columns: [
      id,
      {
        name: 'definition_id',
        comment: 'The definition that this table belongs to.',
        references: {
          table: 'definitions',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'inflection_table_id',
        comment: 'The inflection table that inflected forms are generated from.',
        references: {
          table: 'inflection_tables',
          column: 'id',
        },
      },
      {
        name: 'sort_order',
        comment: 'The sort order of the inflection table within its definition.',
        type: ColumnType.UNSIGNED_INT,
        size: 16,
      },
      {
        name: 'caption',
        comment: 'A short, optional caption of the table, such as "In the sense so-and-so". A single formatted paragraph. See app documentation for details. Links are not permitted inside the table caption.',
        type: ColumnType.JSON,
        allowNull: true,
        default: null,
        export: value => value !== null ? JSON.parse(value) : null,
        import: value => value !== null ? JSON.stringify(value) : null,
      },
    ],
    primaryKey: 'id',
    index: [
      'definition_id',
      'inflection_table_id',
      ['definition_id', 'sort_order'],
    ],
  },

  {
    name: 'definition_forms',
    comment: 'Irregular or otherwise custom inflected forms for individual definitions.',
    columns: [
      {
        name: 'definition_inflection_table_id',
        comment: 'The definition inflection table that this form belongs to.',
        references: {
          table: 'definition_inflection_tables',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'inflected_form_id',
        comment: 'The inflected form that this value overrides.',
        references: {
          table: 'inflected_forms',
          column: 'id',
        },
      },
      {
        name: 'inflected_form',
        comment: 'The inflected form, without stem placeholders.',
        type: ColumnType.VARCHAR,
        size: 160,
      },
    ],
    primaryKey: ['definition_inflection_table_id', 'inflected_form_id'],
    index: [
      'definition_inflection_table_id',
      'inflected_form_id',
    ],
  },

  {
    name: 'derived_definitions',
    comment: 'Definitions that are derived by inflecting a non-derived definition. These are attached to a single lemma. Note that the same lemma may have multiple forms derived from the same non-derived definition, but only one derived form per inflected_form_id. That is, a single lemma may be the nominative singular, accusative singular and dative singular all at once, but it cannot have two nominative singular derivations from the same original definition.',
    columns: [
      {
        name: 'lemma_id',
        comment: 'The lemma that this definition is listed under.',
        references: {
          table: 'lemmas',
          column: 'id',
        },
      },
      {
        name: 'original_definition_id',
        comment: 'The definition that this form was derived from, so that we can link back to it, e.g. "Nominative singular of ...".',
        references: {
          table: 'definitions',
          column: 'id',
          onDelete: 'cascade',
        },
      },
      {
        name: 'inflected_form_id',
        comment: 'The inflected form that this form was derived from.',
        references: {
          table: 'inflected_forms',
          column: 'id',
        },
      },
    ],
    primaryKey: ['lemma_id', 'original_definition_id', 'inflected_form_id'],
    index: [
      'lemma_id',
      'original_definition_id',
      'inflected_form_id',
    ],
  }
];

export default tables;
