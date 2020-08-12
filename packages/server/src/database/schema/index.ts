import {
  TableSchema,
  ColumnSchema,
  ColumnType,
  Collation,
  ReferenceAction,
} from './types';

export const schemaVersion = 1;

// When making changes to the schema, the following invariants MUST hold:
//
// 1. If a table has a column named `id`, it must be the primary key, and no
//    other column can be in the primary key.
// 2. Any column named `id` must also be auto-incremented.
//
// The exporter relies on this. Moreover, SQLite has no support for auto-
// incremented columns that are not the sole PK.
//
// Use the shorthand object defined literally right below this comment if you
// need an `id` column.

// A shorthand object for the `id` column. This does not automagically become
// the primary key; don't forget to set `primaryKey`!
const id: ColumnSchema = {
  name: 'id',
  type: ColumnType.ID,
  autoIncrement: true,
};

const tables: TableSchema[] = [
  // Schema metadata.
  {
    name: 'schema_info',
    columns: [
      // The metadata key.
      {
        name: 'name',
        type: ColumnType.TEXT,
        collate: Collation.BINARY,
      },
      // The metadata value.
      {
        name: 'value',
        type: ColumnType.TEXT,
        collate: Collation.BINARY,
      },
    ],
    primaryKey: 'name',
    skipExport: true,
  },

  // Languages that are defined in the dictionary.
  {
    name: 'languages',
    columns: [
      id,
      // The total number of lemmas in the language. Cached for performance.
      {
        name: 'lemma_count',
        type: ColumnType.INT,
        default: 0,
      },
      // The full display name of the language.
      {
        name: 'name',
        type: ColumnType.TEXT,
      },
    ],
    primaryKey: 'id',
    unique: [
      'name',
    ],
  },

  // Parts of speech defined for a language. A part of speech is associated with
  // every definition, and can define any number of inflection tables.
  {
    name: 'parts_of_speech',
    columns: [
      id,
      // The language that the part of speech belongs to.
      {
        name: 'language_id',
        references: {
          table: 'languages',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The display name of the part of speech.
      {
        name: 'name',
        type: ColumnType.TEXT,
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

  // Inflection tables for each part of speech.
  {
    name: 'inflection_tables',
    columns: [
      id,
      // The parent part of speech.
      {
        name: 'part_of_speech_id',
        references: {
          table: 'parts_of_speech',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The name of the inflection table, shown in admin UIs.
      {
        name: 'name',
        type: ColumnType.TEXT,
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

  // Current and historical versions of each table's layout. The actual layout
  // data is stored in `inflection_table_layouts`.
  {
    name: 'inflection_table_versions',
    columns: [
      id,
      // The parent inflection table.
      {
        name: 'inflection_table_id',
        references: {
          table: 'inflection_tables',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // Indicates whether this is the current layout of the table.
      {
        name: 'is_current',
        type: ColumnType.BOOLEAN,
      },
    ],
    primaryKey: 'id',
    index: [
      'is_current',
    ],
  },

  // Individual cells in an inflection table, which correspond to single
  // inflected forms. The position of a cell is determined by the layout
  // of the inflection table.
  {
    name: 'inflected_forms',
    columns: [
      id,
      // The parent inflection table version.
      {
        name: 'inflection_table_version_id',
        references: {
          table: 'inflection_table_versions',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // Determines whether the inflected form, once computed for a definition,
      // should be added as a separate lemma.
      {
        name: 'derive_lemma',
        type: ColumnType.BOOLEAN,
        default: true,
      },
      // Determines whether the `display_name` was entered specifically by the
      // user, or derived automatically from the header cells in the containing
      // table.
      {
        name: 'custom_display_name',
        type: ColumnType.BOOLEAN,
        default: false,
      },
      // A pattern, such as '{~}s', which describes how to construct the
      // inflected form. Placeholders are replaced by the lemma form and/or
      // custom stems defined for the definition.
      {
        name: 'inflection_pattern',
        type: ColumnType.TEXT,
      },
      // The display name of the inflected form, which is usually derived from
      // the cell's position in its table, and may be edited by the user.
      {
        name: 'display_name',
        type: ColumnType.TEXT,
      },
    ],
    primaryKey: 'id',
    index: [
      'inflection_table_version_id',
    ],
  },

  // Layouts for all inflected tables. This is a separate table for two reasons:
  // it means we don't have to fetch a potentially large JSON object unless the
  // layout is asked for, and it means we can actually reference `inflected_forms`
  // in each cell so the data export/import works.
  {
    name: 'inflection_table_layouts',
    columns: [
      // The parent inflection table version.
      {
        name: 'inflection_table_version_id',
        references: {
          table: 'inflection_table_versions',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // A JSON object that describes the layout of the table. See app
      // documentation for details.
      {
        name: 'layout',
        type: ColumnType.JSON,
      },
      // A JSON array that contains the unique stem names present in the table
      // layout. This is calculated when the layout is updated, and is stored
      // here primarily for performance reasons (so we don't have to walk the
      // table and parse inflection patterns in the admin UI).
      {
        name: 'stems',
        type: ColumnType.JSON,
      },
    ],
    primaryKey: 'inflection_table_version_id',
  },

  // The tags that exist in the dictionary. Tags may be attached to any number
  // of definitions (see `definition_tags`), and are not specific to any
  // language (that is, they are global). Tags names are stored separately to
  // avoid duplicating textual data.
  {
    name: 'tags',
    columns: [
      id,
      // The name of the tag.
      {
        name: 'name',
        type: ColumnType.TEXT,
      },
    ],
    primaryKey: 'id',
    unique: [
      'name',
    ],
  },

  // The lemmas of the dictionary; the words that are listed and looked up.
  // Each lemma may have zero or more regular definitions (see `definitions`)
  // and zero or more derived definitions (see `derived_definitions`), but must
  // have at least one of either kind.
  {
    name: 'lemmas',
    columns: [
      id,
      // The language that the lemma belongs to.
      {
        name: 'language_id',
        references: {
          table: 'languages',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The term being defined. This field uses binary collation, for "correct"
      // uniqueness (we want accented letters to be distinct from their
      // non-accented counterparts, and case matters). This value must be equal
      // to `term_display`.
      {
        name: 'term_unique',
        type: ColumnType.TEXT,
        collate: Collation.BINARY,
      },
      // The term being defined. This field uses the default Unicode collation,
      // for quick sorting. This value must be equal to `term_unique`.
      {
        name: 'term_display',
        type: ColumnType.TEXT,
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

  // Definitions attached to a single lemma. A lemma may have multiple
  // definitions, and can also include forms that are derived by inflecting a
  // definition from this table (see `derived_definitions`).
  {
    name: 'definitions',
    columns: [
      id,
      // The lemma that this definition belongs to.
      {
        name: 'lemma_id',
        references: {
          table: 'lemmas',
          column: 'id',
          onDelete: ReferenceAction.RESTRICT,
        },
      },
      // The language that the definition belongs to.
      {
        name: 'language_id',
        references: {
          table: 'languages',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The part of speech of the definition.
      {
        name: 'part_of_speech_id',
        references: {
          table: 'parts_of_speech',
          column: 'id',
          onDelete: ReferenceAction.RESTRICT,
        },
      },
    ],
    primaryKey: 'id',
    index: [
      'lemma_id',
      'language_id',
      'part_of_speech_id',
    ],
  },

  // Descriptions associated with each definition. This is a separate table for
  // two reasons: it means we don't have to fetch a potentially large JSON
  // object unless the description is asked for, and it means we can actually
  // reference `definitions` in the formatted text so the data export/import
  // works.
  {
    name: 'definition_descriptions',
    columns: [
      // The definition that this description belongs to.
      {
        name: 'definition_id',
        references: {
          table: 'definitions',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The definition text itself. See app documentation for details.
      {
        name: 'description',
        type: ColumnType.JSON,
      },
    ],
    primaryKey: 'definition_id',
  },

  // Inflection stems for individual definitions.
  {
    name: 'definition_stems',
    columns: [
      // The definition that this stem belongs to.
      {
        name: 'definition_id',
        references: {
          table: 'definitions',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The name (key) of the stem.
      {
        name: 'name',
        type: ColumnType.TEXT,
      },
      // The value of the stem.
      {
        name: 'value',
        type: ColumnType.TEXT,
      },
    ],
    primaryKey: ['definition_id', 'name'],
    index: [
      'definition_id',
    ],
  },

  {
    name: 'definition_inflection_tables',
    // Specifies which inflection tables a definition uses. Within a single
    // definition, the same inflection_table_id may occur multiple times:
    // sometimes a word has different inflected forms depending on context or
    // usage.
    columns: [
      id,
      // The definition that this table belongs to.
      {
        name: 'definition_id',
        references: {
          table: 'definitions',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The inflection table that inflected forms are generated from.
      {
        name: 'inflection_table_id',
        references: {
          table: 'inflection_tables',
          column: 'id',
          onDelete: ReferenceAction.RESTRICT,
        },
      },
      // The inflection table version that inflected forms are generated from.
      {
        name: 'inflection_table_version_id',
        references: {
          table: 'inflection_table_versions',
          column: 'id',
          onDelete: ReferenceAction.RESTRICT,
        },
      },
      // The sort order of the inflection table within its definition.
      {
        name: 'sort_order',
        type: ColumnType.INT,
      },
      // A short, optional caption of the table, such as "In the sense so-and-so".
      // A single formatted paragraph. See app documentation for details. Links
      // are not permitted inside the table caption.
      {
        name: 'caption',
        type: ColumnType.JSON,
        allowNull: true,
        default: null,
      },
    ],
    primaryKey: 'id',
    index: [
      'definition_id',
      'inflection_table_id',
      'inflection_table_version_id',
      ['definition_id', 'sort_order'],
    ],
  },

  // Irregular or otherwise custom inflected forms for individual definitions.
  {
    name: 'definition_forms',
    columns: [
      // The definition inflection table that this form belongs to.
      {
        name: 'definition_inflection_table_id',
        references: {
          table: 'definition_inflection_tables',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The inflected form that this value overrides.
      {
        name: 'inflected_form_id',
        references: {
          table: 'inflected_forms',
          column: 'id',
          onDelete: ReferenceAction.RESTRICT,
        },
      },
      // The inflected form, without stem placeholders.
      {
        name: 'inflected_form',
        type: ColumnType.TEXT,
      },
    ],
    primaryKey: ['definition_inflection_table_id', 'inflected_form_id'],
    index: [
      'definition_inflection_table_id',
      'inflected_form_id',
    ],
  },

  // Tags attached to individual definitions. A definition can have any number of tags.
  {
    name: 'definition_tags',
    columns: [
      // The definition this tag is attached to.
      {
        name: 'definition_id',
        references: {
          table: 'definitions',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The tag used by the definition.
      {
        name: 'tag_id',
        references: {
          table: 'tags',
          column: 'id',
          onDelete: ReferenceAction.RESTRICT,
        },
      },
    ],
    primaryKey: ['definition_id', 'tag_id'],
  },

  // Definitions that are derived by inflecting a non-derived definition. These
  // are attached to a single lemma. Note that the same lemma may have multiple
  // forms derived from the same non-derived definition, but only one derived
  // form per inflected_form_id. That is, a single lemma may be the nominative
  // singular, accusative singular and dative singular all at once, but it
  // cannot have two nominative singular derivations from the same original
  // definition.
  {
    name: 'derived_definitions',
    columns: [
      // The lemma that this definition is listed under.
      {
        name: 'lemma_id',
        references: {
          table: 'lemmas',
          column: 'id',
          onDelete: ReferenceAction.RESTRICT,
        },
      },
      // The definition that this form was derived from, so that we can link
      // back to it, e.g. "Nominative singular of ...".
      {
        name: 'original_definition_id',
        references: {
          table: 'definitions',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The inflected form that this form was derived from.
      {
        name: 'inflected_form_id',
        references: {
          table: 'inflected_forms',
          column: 'id',
          onDelete: ReferenceAction.RESTRICT,
        },
      },
    ],
    primaryKey: ['lemma_id', 'original_definition_id', 'inflected_form_id'],
    index: [
      'lemma_id',
      'original_definition_id',
      'inflected_form_id',
    ],
  },

  // Users which the end user can authenticate as in order to perform mutations.
  // This table is only needed if you connect to the Condict server remotely;
  // when Condict runs completely locally, authentication is not necessary.
  {
    name: 'users',
    columns: [
      id,
      // The name of the user. Usernames are case-sensitive and unique.
      {
        name: 'name',
        type: ColumnType.TEXT,
      },
      // A hashed version of the user's password. Passwords are hashed using
      // bcrypt.
      {
        name: 'password_hash',
        type: ColumnType.TEXT,
      },
    ],
    primaryKey: 'id',
    unique: ['name'],
    skipExport: true,
  },

  // Sessions associated with each user. Sessions are identified by a string ID,
  // and expire after some time.
  {
    name: 'user_sessions',
    columns: [
      // The ID of the session, which is an arbitrary string value.
      {
        name: 'id',
        type: ColumnType.TEXT,
      },
      // The user that the session belongs to.
      {
        name: 'user_id',
        references: {
          table: 'users',
          column: 'id',
          onDelete: ReferenceAction.CASCADE,
        },
      },
      // The date and time that the session expires, as the number of
      // milliseconds since midnight 1 January, 1970, UTC.
      {
        name: 'expires_at',
        type: ColumnType.INT,
      },
    ],
    primaryKey: 'id',
    skipExport: true,
  },
];

export default tables;
