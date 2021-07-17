export interface TableSchema {
  readonly name: string;
  readonly commands: readonly string[];
}

export const schemaVersion = 1;

// Shared full-text-search tokenize parameters. This is by no means the best
// possible configuration for all languages, but should hopefully be Good Enough
// for most reasonable situations.
// NOTE: The token character included here MUST be kept in sync with the regex
// for formatFtsQuery (../../model/search-index/query).
const FtsTokenize = "unicode61 remove_diacritics 0 categories 'L* N* Co Mc Mn' tokenchars ''''";

const tables: readonly TableSchema[] = [
  {
    name: 'schema_info',
    commands: [`
      create table schema_info (
        -- The metadata key.
        name text not null collate binary,
        -- The metadata value.
        value text not null collate binary,
        primary key (name)
      )`,
    ],
  },

  // Formatted rich text descriptions, used in various places in the dictionary.
  // This table needs to be defined first so that its IDs can be used in foreign
  // keys elsewhere.
  {
    name: 'descriptions',
    commands: [`
      create table descriptions (
        id integer not null primary key,
        -- The formatted text itself, as a JSON document. See app documentation
        -- for details.
        description text not null
      )`,
    ],
  },

  // Languages that are defined in the dictionary.
  {
    name: 'languages',
    commands: [`
      create table languages (
        id integer not null primary key,
        -- The total number of lemmas in the language. Cached for performance.
        lemma_count integer not null default 0,
        -- The description of the language.
        description_id integer not null,
        -- The date and time the language was created, as the number of
        -- milliseconds since midnight 1 January, 1970, UTC.
        time_created integer not null,
        -- The date and time the language was last updated, as the number of
        -- milliseconds since midnight 1 January, 1970, UTC.
        time_updated integer not null,
        -- The full display name of the language.
        name text not null collate unicode,

        foreign key (description_id)
          references descriptions
          on delete restrict
      )`,
      `create unique index \`languages(name)\` on languages(name)`,
      // Descriptions are unique per language.
      `create unique index \`languages(description_id)\` on languages(description_id)`,
      `create index \`languages(time_created)\` on languages(time_created)`,
      `create index \`languages(time_updated)\` on languages(time_updated)`,
    ],
  },

  // Search table for languages.
  {
    name: 'languages_fts',
    commands: [`
      create virtual table languages_fts using fts5(
        name,
        tokenize = "${FtsTokenize}"
      )`,
    ],
  },

  // Parts of speech defined for a language. A part of speech is associated with
  // every definition, and can define any number of inflection tables.
  {
    name: 'parts_of_speech',
    commands: [`
      create table parts_of_speech (
        id integer not null primary key,
        -- The language that the part of speech belongs to.
        language_id integer not null,
        -- The date and time the part of speech was created, as the number of
        -- milliseconds since midnight 1 January, 1970, UTC.
        time_created integer not null,
        -- The date and time the part of speech was last updated, as the number
        -- of milliseconds since midnight 1 January, 1970, UTC.
        time_updated integer not null,
        -- The display name of the part of speech.
        name text not null collate unicode,

        foreign key (language_id)
          references languages
          on delete cascade
      )`,
      `create unique index \`parts_of_speech(language_id,name)\` on parts_of_speech(language_id, name)`,
      `create index \`parts_of_speech(time_created)\` on parts_of_speech(time_created)`,
      `create index \`parts_of_speech(time_updated)\` on parts_of_speech(time_updated)`,
    ],
  },

  // Search table for parts of speech.
  {
    name: 'parts_of_speech_fts',
    commands: [`
      create virtual table parts_of_speech_fts using fts5(
        name,
        tokenize = "${FtsTokenize}"
      )`,
    ],
  },

  // Inflection tables for each part of speech.
  {
    name: 'inflection_tables',
    commands: [`
      create table inflection_tables (
        id integer not null primary key,
        -- The parent part of speech.
        part_of_speech_id integer not null,
        -- The date and time the inflection table was created, as the number of
        -- milliseconds since midnight 1 January, 1970, UTC.
        time_created integer not null,
        -- The date and time the inflection table was last updated, as the
        -- number of milliseconds since midnight 1 January, 1970, UTC.
        time_updated integer not null,
        -- The name of the inflection table, shown in admin UIs.
        name text not null collate unicode,

        foreign key (part_of_speech_id)
          references parts_of_speech
          on delete cascade
      )`,
      `create unique index \`inflection_tables(part_of_speech_id,name)\` on inflection_tables(part_of_speech_id, name)`,
      `create index \`inflection_tables(time_created)\` on inflection_tables(time_created)`,
      `create index \`inflection_tables(time_updated)\` on inflection_tables(time_updated)`,
    ],
  },

  // Current and historical versions of each table's layout. The actual layout
  // data is stored in `inflection_table_layouts`.
  {
    name: 'inflection_table_versions',
    commands: [`
      create table inflection_table_versions (
        id integer not null primary key,
        -- The parent inflection table.
        inflection_table_id integer not null,
        -- Indicates whether this is the current layout of the table.
        is_current integer not null,

        foreign key (inflection_table_id)
          references inflection_tables
          on delete cascade
      )`,
      `create index \`inflection_table_versions(is_current)\` on inflection_table_versions(is_current)`,
    ],
  },

  // Layouts for all inflected tables. This is a separate table so we don't have
  // to fetch a potentially large JSON object unless the layout is asked for,
  // and so that `inflected_forms` have something to refer to (namely, the table
  // `inflection_table_versions`) before the layout has been inserted.
  {
    name: 'inflection_table_layouts',
    commands: [`
      create table inflection_table_layouts (
        -- The parent inflection table version.
        inflection_table_version_id integer not null primary key,
        -- A JSON object that describes the layout of the table. See app
        -- documentation for details.
        layout text not null,
        -- A JSON array that contains the unique stem names present in the table
        -- layout. This is calculated when the layout is updated, and is stored
        -- here primarily for performance reasons (so we don't have to walk the
        -- table and parse inflection patterns in the UI).
        stems text not null,

        foreign key (inflection_table_version_id)
          references inflection_table_versions
          on delete cascade
      )`,
    ],
  },

  // Individual cells in an inflection table, which correspond to single
  // inflected forms. The position of a cell is determined by the layout
  // of the inflection table.
  {
    name: 'inflected_forms',
    commands: [`
      create table inflected_forms (
        id integer not null primary key,
        -- The parent inflection table version.
        inflection_table_version_id integer not null,
        -- Determines whether the inflected form, once computed for a definition,
        -- should be added as a separate lemma.
        derive_lemma integer not null default 1,
        -- Determines whether the 'display_name' was entered specifically by the
        -- user, or derived automatically from the header cells in the containing
        -- table.
        custom_display_name integer not null default 0,
        -- A pattern, such as '{~}s', which describes how to construct the
        -- inflected form. Placeholders are replaced by the lemma form and/or
        -- custom stems defined for the definition.
        inflection_pattern text not null,
        -- The display name of the inflected form, which is usually derived from
        -- the cell's position in its table, and may be edited by the user.
        display_name text not null,

        foreign key (inflection_table_version_id)
          references inflection_table_versions
          on delete cascade
      )`,
      `create index \`inflected_forms(inflection_table_version_id)\` on inflected_forms(inflection_table_version_id)`,
    ],
  },

  // The lemmas of the dictionary; the words that are listed and looked up.
  // Each lemma may have zero or more regular definitions (see `definitions`)
  // and zero or more derived definitions (see `derived_definitions`), but must
  // have at least one of either kind.
  {
    name: 'lemmas',
    commands: [`
      create table lemmas (
        id integer not null primary key,
        -- The language that the lemma belongs to.
        language_id integer not null,
        -- The term being defined.
        term text not null collate unicode,

        foreign key (language_id)
          references languages
          on delete cascade
      )`,
      `create unique index \`lemmas(language_id,term)\` on lemmas(language_id, term)`,
    ],
  },

  // Search table for lemmas.
  {
    name: 'lemmas_fts',
    commands: [`
      create virtual table lemmas_fts using fts5(
        term,
        tokenize = "${FtsTokenize}",
        prefix = '1 2 3 4'
      )`,
    ],
  },

  // Definitions of dictionary words. The primary component of a definition is
  // its free text description (stored in `descriptions`). In addition to the
  // properties in this table, each definition can also have multiple inflection
  // tables (see `definition_inflection_tables`) and associated stems (see
  // `definition_stems`).
  {
    name: 'definitions',
    commands: [`
      create table definitions (
        id integer not null primary key,
        -- The lemma that this definition belongs to.
        lemma_id integer not null,
        -- The language that the definition belongs to.
        language_id integer not null,
        -- The part of speech of the definition.
        part_of_speech_id integer not null,
        -- The description of the definition; the definition text itself.
        description_id integer not null,
        -- The date and time the definition was created, as the number of
        -- milliseconds since midnight 1 January, 1970, UTC.
        time_created integer not null,
        -- The date and time the definition was last updated, as the number of
        -- milliseconds since midnight 1 January, 1970, UTC.
        time_updated integer not null,

        foreign key (lemma_id)
          references lemmas
          on delete restrict,
        foreign key (language_id)
          references languages
          on delete cascade,
        foreign key (part_of_speech_id)
          references parts_of_speech
          on delete restrict,
        foreign key (description_id)
          references descriptions
          on delete restrict
      )`,
      `create index \`definitions(lemma_id)\` on definitions(lemma_id)`,
      `create index \`definitions(language_id)\` on definitions(language_id)`,
      `create index \`definitions(part_of_speech_id)\` on definitions(part_of_speech_id)`,
      // Descriptions are unique per definition.
      `create unique index \`definitions(description_id)\` on definitions(description_id)`,
      `create index \`definitions(time_created)\` on definitions(time_created)`,
      `create index \`definitions(time_updated)\` on definitions(time_updated)`,
    ],
  },

  {
    name: 'definitions_fts',
    commands: [`
      create virtual table definitions_fts using fts5(
        description,
        tokenize = "${FtsTokenize}"
      )`,
    ],
  },

  // Inflection stems for individual definitions.
  {
    name: 'definition_stems',
    commands: [`
      create table definition_stems (
        -- The definition that this stem belongs to.
        definition_id integer not null,
        -- The name (key) of the stem.
        name text not null,
        -- The value of the stem.
        value text not null,

        primary key (definition_id, name),

        foreign key (definition_id)
          references definitions
          on delete cascade
      )`,
    ],
  },

  // Specifies which inflection tables a definition uses. Within a single
  // definition, the same inflection_table_id may occur multiple times:
  // sometimes a word has different inflected forms depending on context or
  // usage.
  {
    name: 'definition_inflection_tables',
    commands: [`
      create table definition_inflection_tables (
        id integer not null primary key,
        -- The definition that this table belongs to.
        definition_id integer not null,
        -- The inflection table that inflected forms are generated from.
        inflection_table_id integer not null,
        -- The inflection table version that inflected forms are generated from.
        inflection_table_version_id integer not null,
        -- The sort order of the inflection table within its definition.
        sort_order integer not null,
        -- A short, optional caption of the table, such as "In the sense so-and-so".
        -- A single formatted paragraph. See app documentation for details. Links
        -- are not permitted inside the table caption.
        caption text,

        foreign key (definition_id)
          references definitions
          on delete cascade,
        foreign key (inflection_table_id)
          references inflection_tables
          on delete restrict,
        foreign key (inflection_table_version_id)
          references inflection_table_versions
          on delete restrict
      )`,
      `create index \`definition_inflection_tables(definition_id,sort_order)\` on definition_inflection_tables(definition_id, sort_order)`,
      `create index \`definition_inflection_tables(inflection_table_id)\` on definition_inflection_tables(inflection_table_id)`,
      `create index \`definition_inflection_tables(inflection_table_version_id)\` on definition_inflection_tables(inflection_table_version_id)`,
    ],
  },

  // Irregular or otherwise custom inflected forms for individual definitions
  // inflection tables.
  {
    name: 'definition_forms',
    commands: [`
      create table definition_forms (
        -- The definition inflection table that this form belongs to.
        definition_inflection_table_id integer not null,
        -- The inflected form that this value overrides.
        inflected_form_id integer not null,
        -- The inflected form, without stem placeholders.
        inflected_form text not null,

        primary key (definition_inflection_table_id, inflected_form_id),

        foreign key (definition_inflection_table_id)
          references definition_inflection_tables
          on delete cascade,
        foreign key (inflected_form_id)
          references inflected_forms
          on delete restrict
      )`,
      `create index \`definition_forms(inflected_form_id)\` on definition_forms(inflected_form_id)`,
    ],
  },

  // Tags attached to individual definitions. A definition can have any number
  // of tags.
  {
    name: 'definition_tags',
    commands: [`
      create table definition_tags (
        -- The definition this tag is attached to.
        definition_id integer not null,
        -- The tag used by the definition.
        tag_id integer not null,

        primary key (definition_id, tag_id),

        foreign key (definition_id)
          references definitions
          on delete cascade,
        foreign key (tag_id)
          references tags
          on delete restrict
      )`,
      `create index \`definition_tags(tag_id)\` on definition_tags(tag_id)`,
    ],
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
    commands: [`
      create table derived_definitions (
        -- The lemma that this definition is listed under.
        lemma_id integer not null,
        -- The definition that this form was derived from, so that we can link
        -- back to it, e.g. "Nominative singular of ...".
        original_definition_id integer not null,
        -- The inflected form that this form was derived from.
        inflected_form_id integer not null,

        primary key (lemma_id, original_definition_id, inflected_form_id),

        foreign key (lemma_id)
          references lemmas
          on delete restrict,
        foreign key (original_definition_id)
          references definitions
          on delete cascade,
        foreign key (inflected_form_id)
          references inflected_forms
          on delete restrict
      )`,
      `create index \`derived_definitions(original_definition_id)\` on derived_definitions(original_definition_id)`,
      `create index \`derived_definitions(inflected_form_id)\` on derived_definitions(inflected_form_id)`,
    ],
  },

  // The tags that exist in the dictionary. Tags may be attached to any number
  // of definitions (see `definition_tags`), and are not specific to any
  // language (that is, they are global). Tags names are stored separately to
  // avoid duplicating textual data.
  {
    name: 'tags',
    commands: [`
      create table tags (
        id integer not null,
        -- The name of the tag.
        name text not null collate unicode,
        primary key (id)
      )`,
      `create unique index \`tags(name)\` on tags(name)`,
    ],
  },

  // Search table for tags.
  {
    name: 'tags_fts',
    commands: [`
      create virtual table tags_fts using fts5(
        name,
        tokenize = "${FtsTokenize}",
        prefix = '1 2 3'
      )`,
    ],
  },

  // Users which the end user can authenticate as in order to perform mutations.
  // This table is only needed if you connect to the Condict server remotely;
  // when Condict runs completely locally, authentication is not necessary.
  {
    name: 'users',
    commands: [`
      create table users (
        id integer not null primary key,
        -- The name of the user. Usernames are case-sensitive and unique.
        name text not null,
        -- A hashed version of the user's password.
        password_hash text not null
      )`,
      `create unique index \`users(name)\` on users(name)`,
    ],
  },

  // Sessions associated with each user. Sessions are identified by a string ID,
  // and expire after some time.
  {
    name: 'user_sessions',
    commands: [`
      create table user_sessions (
        -- The ID of the session, which is an arbitrary string value.
        id text not null primary key,
        -- The user that the session belongs to.
        user_id integer not null,
        -- The date and time that the session expires, as the number of
        -- milliseconds since midnight 1 January, 1970, UTC.
        expires_at integer not null,

        foreign key (user_id)
          references users
          on delete cascade
      )`,
      `create index \`user_sessions(user_id)\` on user_sessions(user_id)`,
    ],
  },
];

export default tables;
