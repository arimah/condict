/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

declare const IdKind: unique symbol;

// This is a hack to get TypeScript to treat different ID types as distinct.
// The actual value will be a number (hence the `number` part), but by
// pretending there's an extra property that is unique to each type, we can
// get TypeScript to reject invalid ID uses, such as attempting to assign
// a DefinitionId to a LemmaId.

/** Represents an ID of the specified kind. */
export type IdOf<T extends string> = number & {
  [IdKind]: T;
};

declare const ArgsType: unique symbol;

/**
 * Specifies that a field has one or more arguments. The field's argument
 * type can be extracted using FieldArgs.
 */
export type WithArgs<A, T> = T & {
  [ArgsType]: A;
};

/** Extracts a field's argument types. */
export type FieldArgs<F> = F extends WithArgs<infer A, unknown> ? A : {};

/**
 * A block element. Block elements make up the top-level nodes of formatted text.
 * These include paragraphs, headings and list items.
 */
export type BlockElement = {
  /**
   * The block kind.
   */
  kind: BlockKind;
  /**
   * The indentation level of the element, starting at 0.
   */
  level: number;
  /**
   * A list of inlines, which contain the block's formatted text content as well
   * as links.
   */
  inlines: InlineElement[];
};

/**
 * Input type for a block element.
 */
export type BlockElementInput = {
  /**
   * The block kind.
   */
  kind: BlockKind;
  /**
   * The indentation level of the element, starting at 0. If omitted, the default
   * value of 0 is used.
   */
  level?: number | null;
  /**
   * A list of inlines, which contain the block's formatted text content as well
   * as links.
   */
  inlines: InlineElementInput[];
};

/**
 * The kind of a block element.
 */
export type BlockKind =
  /**
   * A paragraph of text without any additional meaning.
   */
  | 'PARAGRAPH'
  /**
   * A first-level heading.
   */
  | 'HEADING_1'
  /**
   * A second-level heading.
   */
  | 'HEADING_2'
  /**
   * An ordered list item. All consecutive ordered list items on the same level
   * belong to the same list.
   */
  | 'OLIST_ITEM'
  /**
   * An unordered list item. All consecutive unordered list items on the same
   * level belong to the same list.
   */
  | 'ULIST_ITEM'
;

/**
 * A custom inflected form, typically an irregular form. It overrides a single cell
 * in a definition inflection table.
 */
export type CustomInflectedForm = {
  /**
   * The table that the form belongs to.
   */
  table: DefinitionInflectionTable;
  /**
   * The inflected form that this value replaces within its table.
   */
  inflectedForm: InflectedForm;
  /**
   * The inflected word itself; the value of the table cell.
   */
  value: string;
};

export type CustomInflectedFormInput = {
  /**
   * The inflected form that this value replaces within its table.
   */
  inflectedFormId: InflectedFormId;
  /**
   * The inflected word itself; the value of the table cell.
   */
  value: string;
};

/**
 * As its name suggests, a definition defines a lemma. A definition has a part of
 * speech, a description, and, optionally, some inflection tables.
 * 
 * A definition's description contains free-form formatted text. Paragraphs, list
 * items, headings and other things.
 */
export type Definition = {
  /**
   * The globally unique ID of the definition.
   */
  id: DefinitionId;
  /**
   * The term that the definition applies to. This value is equal to `lemma.term`
   * and is provided here for convenience.
   */
  term: string;
  /**
   * The part of speech that the word belongs to.
   */
  partOfSpeech: PartOfSpeech;
  /**
   * Formatted text that describes the definition.
   */
  description: BlockElement[];
  /**
   * Inflection stems that belong to this definition.
   */
  stems: DefinitionStem[];
  /**
   * Inflection tables that are used by this definiton. The values are returned in
   * the order specified by the user.
   */
  inflectionTables: DefinitionInflectionTable[];
  /**
   * Tags associated with this definition.
   */
  tags: Tag[];
  /**
   * Custom field values attached to this definition. This list only includes those
   * fields which have been explicitly assigned a value. If a field is absent from
   * this list, it counts as unset. Note that boolean fields are not strictly true
   * or false, but rather set or unset: when a boolean field is absent here, it is
   * treated as being false.
   */
  fields: DefinitionFieldValue[];
  /**
   * Definitions derived from inflected forms of this definition.
   * 
   * Note that this list only includes inflected forms set to have lemmas derived
   * automatically. To get all inflected forms of a definition, you must fetch the
   * `stems` and `inflectionTables` of the definition and "manually" inflect the
   * word.
   * 
   * Since there may be many derived definitions, this field is paginated. If
   * provided, `page.perPage` cannot exceed 200.
   */
  derivedDefinitions: WithArgs<{
    page?: PageParams | null;
  }, DerivedDefinitionConnection>;
  /**
   * The lemma that the definition belongs to.
   */
  lemma: Lemma;
  /**
   * The language that the definition belongs to. This value is equal to
   * `lemma.language` and is provided here for convenience.
   */
  language: Language;
  /**
   * The time that the definition was created.
   */
  timeCreated: UtcInstant;
  /**
   * The time of the most recent update to the definition. This time covers updates
   * performed on the definition itself, or on its inflection tables, tags or
   * stems.
   */
  timeUpdated: UtcInstant;
};

/**
 * Contains paginated results from one of the following fields:
 * 
 * * `Language.recentDefinitions`
 * * `InflectionTableLayout.usedByDefinitions`
 * * `PartOfSpeech.usedByDefinitions`
 */
export type DefinitionConnection = {
  /**
   * Pagination metadata for this batch.
   */
  page: PageInfo;
  /**
   * The definitions in this batch.
   */
  nodes: Definition[];
};

/**
 * Input type for a single custom field value attached to a definition. At most one
 * of `booleanValue`, `listValues` and `textValue` can be set, and must match the
 * field's type.
 */
export type DefinitionFieldInput = {
  /**
   * The field to assign a value to.
   */
  fieldId: FieldId;
  /**
   * The value of a boolean field.
   */
  booleanValue?: boolean | null;
  /**
   * The value of a list field. Some fields may only accept a single value. Passing
   * the empty list is equivalent to omitting the field altogether.
   */
  listValues?: FieldValueId[] | null;
  /**
   * The value of a plain-text field.
   */
  textValue?: string | null;
};

/**
 * Contains the value(s) of a list-type field.
 */
export type DefinitionFieldListValue = {
  field: Field;
  /**
   * The selected values. The field may allow only one value to be selected, or
   * multiple. This list always has at least one entry, as the empty list is not
   * stored anywhere; it's equivalent to not setting the field.
   */
  values: FieldValue[];
};

/**
 * Contains the value of a plain text field.
 */
export type DefinitionFieldPlainTextValue = {
  field: Field;
  /**
   * The field value. The empty string is a valid value, and is *not* equivalent
   * to not setting the field.
   */
  value: string;
};

/**
 * For a boolean field, indicates that the field has the value `true`. Fields that
 * were set to `false` are omitted altogether; they will not be present in the
 * definition's `Definition.fields` list.
 */
export type DefinitionFieldTrueValue = {
  field: Field;
};

/**
 * The value of a single field as associated with a definition.
 */
export type DefinitionFieldValue =
  | DefinitionFieldTrueValue
  | DefinitionFieldListValue
  | DefinitionFieldPlainTextValue;

/**
 * Represents a definition ID.
 */
export type DefinitionId = IdOf<'Definition'>;

/**
 * An inflection table attached to a single definition. In addition to containing
 * an table, this type contains an otional caption and any number of custom forms
 * (chiefly for defining irregular forms).
 * 
 * Note that a definition can have multiple instances of the same inflection table.
 * Some words inflect differently depending on usage; Condict supports this.
 */
export type DefinitionInflectionTable = {
  /**
   * The globally unique ID of the definition inflection table.
   */
  id: DefinitionInflectionTableId;
  /**
   * An optional formatted text that describes the table.
   */
  caption: TableCaption | null;
  /**
   * A raw JSON string equivalent of `caption`. Generally, you should avoid using
   * this field; prefer `caption` whenever possible.
   */
  captionRaw: string | null;
  /**
   * A list of custom inflected forms, which replace forms in the table. These are
   * _generally_ irregular forms, but this is not guaranteed.
   * 
   * Forms are ordered by inflected form ID.
   */
  customForms: CustomInflectedForm[];
  /**
   * The inflection table used by the definition.
   */
  inflectionTable: InflectionTable;
  /**
   * The inflection table layout used by this definition. If the inflection table
   * has changed since the definition was added, this layout may point to an older
   * version of the table; see the `InflectionTableLayout.isCurrent` field.
   */
  inflectionTableLayout: InflectionTableLayout;
  /**
   * The definition that this inflection table is used in.
   */
  definition: Definition;
};

/**
 * Represents a definition inflection table ID.
 */
export type DefinitionInflectionTableId = IdOf<'DefinitionInflectionTable'>;

/**
 * Contains the definition that a definition link points to.
 */
export type DefinitionLinkTarget = {
  /**
   * The ID of the definition that the link points to.
   */
  id: DefinitionId;
  /**
   * The definition pointed to by the link. If the definition has been removed
   * since the link was created, this field is null.
   */
  definition: Definition | null;
};

/**
 * A search result that matches a definition.
 */
export type DefinitionSearchResult = {
  /**
   * A snippet over the matching part of the description text.
   */
  descriptionSnippet: MatchingSnippet;
  /**
   * The definition that matched the search.
   */
  definition: Definition;
};

/**
 * An inflection stem for a single definition. Stems are used when inflecting the
 * word: inflected forms contain patterns like `{pl}es`, where `{pl}` is replaced
 * with the value of the stem named `pl`.
 */
export type DefinitionStem = {
  /**
   * The name of the stem.
   */
  name: string;
  /**
   * The value of the stem.
   */
  value: string;
  /**
   * The definition that the stem is attached to.
   */
  definition: Definition;
};

export type DefinitionUsingInflectionTable = {
  /**
   * The definition that uses the inflection table.
   */
  definition: Definition;
  /**
   * Indicates whether the definition uses an older version of the table. Note that
   * definitions can have multiple instances of the same inflection table, and they
   * do not all need to be the same version (tables are upgraded separately). This
   * field indicates whether *any* of the definition's tables use an older layout
   * version.
   */
  hasOldLayouts: boolean;
};

/**
 * Contains paginated results from the `InflectionTable.usedByDefinitions` field.
 */
export type DefinitionUsingInflectionTableConnection = {
  /**
   * Pagination metadata for this batch.
   */
  page: PageInfo;
  /**
   * The entries in this batch.
   */
  nodes: DefinitionUsingInflectionTable[];
};

/**
 * A _derived_ definition is an inflected form of a word. When a regular definition
 * is given an inflection table, each form whose `InflectedForm.deriveLemma` value
 * is true will be added as a derived definition.
 * 
 * This enables the dictionary to show words like this:
 * 
 * > **birds**
 * >
 * > 1. _plural of_ bird
 */
export type DerivedDefinition = {
  /**
   * The term that the definition applies to. This value is equal to `lemma.term`
   * and is provided here for convenience.
   */
  term: string;
  /**
   * The definition that this definition was derived from.
   */
  derivedFrom: Definition;
  /**
   * The inflected form that this definition was derived from.
   */
  inflectedForm: InflectedForm;
  /**
   * The lemma that the definition belongs to.
   */
  lemma: Lemma;
  /**
   * The language that the definition belongs to. This value is equal to
   * `lemma.language` and `derivedFrom.language`, and is provided here for
   * convenience.
   */
  language: Language;
};

/**
 * Contains paginated results from the `Definition.derivedDefinitions` field.
 */
export type DerivedDefinitionConnection = {
  /**
   * Pagination metadata for this batch.
   */
  page: PageInfo;
  /**
   * The derived definitions in this batch.
   */
  nodes: DerivedDefinition[];
};

/**
 * Input type for editing a definition's inflection table.
 */
export type EditDefinitionInflectionTableInput = {
  /**
   * The ID of the definition inflection table. If set, it will update an existing
   * definition inflection table.
   */
  id?: DefinitionInflectionTableId | null;
  /**
   * An optional formatted text that describes the table.
   */
  caption?: TableCaptionInput | null;
  /**
   * A list of custom inflected forms, which replace forms in the table. These are
   * _generally_ irregular forms, but this is not guaranteed.
   */
  customForms: CustomInflectedFormInput[];
  /**
   * The inflection table used by the definition. When editing an existing table
   * (`id` is not null), this property is ignored; you cannot change to another table.
   */
  inflectionTableId: InflectionTableId;
  /**
   * If true, upgrades the inflection table's layout to the current version. If the
   * table already uses the current version, this field has no effect. When adding
   * a new table (`id` is null), this field is ignored; the latest layout version
   * is always used. If omitted, defaults to false.
   */
  upgradeTableLayout?: boolean | null;
};

/**
 * Input type for editing an existing definition. The ID is a separate argument.
 */
export type EditDefinitionInput = {
  /**
   * If set, updates the definition term.
   */
  term?: string | null;
  /**
   * If set, updates the part of speech.
   */
  partOfSpeechId?: PartOfSpeechId | null;
  /**
   * If set, updates the definition description.
   */
  description?: BlockElementInput[] | null;
  /**
   * If set, updates the definition's inflection stems.
   */
  stems?: StemInput[] | null;
  /**
   * If set, updates the definition's inflection tables. If the `id` property is
   * set on any table in this list, it will update that existing table. For each
   * table _without_ an `id`, a new definition inflection table is created.
   */
  inflectionTables?: EditDefinitionInflectionTableInput[] | null;
  /**
   * If set, updates the definition's tags.
   */
  tags?: string[] | null;
  /**
   * If set, updates the definition's custom field values. To clear the
   * definition's field values, pass an empty array, not `null`.
   */
  fields?: DefinitionFieldInput[] | null;
};

/**
 * Input type for editing an existing field. The ID is a separate argument.
 */
export type EditFieldInput = {
  /**
   * If set, updates the field's name.
   */
  name?: string | null;
  /**
   * If set, updates the abbreviated version of the field's name.
   */
  nameAbbr?: string | null;
  /**
   * If set, changes the field's value type.
   * 
   * Changing a field's value type is permitted under the following circumstances:
   * 
   * * If the current type is `FIELD_LIST_ONE` and the new type is `FIELD_LIST_MANY`,
   *   or vice versa, in which case no updates are performed on definitions with
   *   values for the field. When going from multi-select to single-select, note
   *   that existing assigned values are *not* affected, but when editing a
   *   definition with multiple values, extraneous values must be deselected.
   * * In all other cases – when moving from boolean to non-boolean, list to
   *   non-list, text to non-text – the change is allowed only if there are no
   *   definitions using the field. This is to prevent confusion and complexity
   *   arising from having to decide what to do with existing values.
   */
  valueType?: FieldValueType | null;
  /**
   * If set, updates the field's values, for a list field. A list of field values
   * is *required* if the field is changing to a list type; it cannot be null. If
   * the field is not a list type, or is being changed to a non-list type, this
   * value *must* be null.
   * 
   * When editing the values of a list field, *all* of the field's values must be
   * present here. Omitted values will be deleted.
   */
  listValues?: FieldValueInput[] | null;
  /**
   * If set, updates the parts of speech that this field can be used in. To mark a
   * field as usable in any part of speech, even ones that are added in the future,
   * pass the empty list. It is not possible to create a field that cannot be used
   * in any part of speech.
   */
  partOfSpeechIds?: PartOfSpeechId[] | null;
};

/**
 * Input type for editing an existing field value through `editFieldValue`. The ID
 * is a separate argument.
 * 
 * Other input types for field values are:
 * 
 * * `NewFieldValueInput`, used by `addFieldValue`
 * * `FieldValueInput`, used in `NewFieldInput` and `EditFieldInput`
 */
export type EditFieldValueInput = {
  /**
   * If set, updates the field value text.
   */
  value?: string | null;
  /**
   * If set, updates the abbreviated version of the `value`. If this is the empty
   * string, then the field value has no abbreviated form.
   */
  valueAbbr?: string | null;
};

/**
 * Input type for editing an existing inflection table. It is not possible to move
 * an inflection table to another language.
 */
export type EditInflectionTableInput = {
  /**
   * If set, renames the inflection table.
   */
  name?: string | null;
  /**
   * If set, updates the layout of the inflection table.
   * 
   * If the table is used by any definitions, changing the layout will cause a new
   * new layout version to be created. See the documentation of `InflectionTable`.
   */
  layout?: InflectionTableRowInput[] | null;
};

/**
 * Input type for editing an existing language.
 */
export type EditLanguageInput = {
  /**
   * If set, updates the display name of the language.
   */
  name?: string | null;
  /**
   * If set, updates the language's description.
   */
  description?: BlockElementInput[] | null;
};

/**
 * Input type for editing an existing part of speech.
 */
export type EditPartOfSpeechInput = {
  /**
   * If set, renames the part of speech.
   */
  name?: string | null;
  /**
   * If set, updates the part of speech description.
   */
  description?: BlockElementInput[] | null;
};

/**
 * Represents a failed login attempt.
 */
export type FailedLogin = {
  /**
   * The reason for the failed login.
   */
  reason: LoginFailureReason;
};

/**
 * A field contains some data about a definition. A field can contain anything
 * the user wants. Noun class, verb class, gender, inflection type, telicity,
 * pronunciation key, obsolete, and so on. The user has full control over the
 * field's name and possible values.
 * 
 * Fields can also be restricted by part of speech, such that some fields are
 * only visible on certain parts of speech. For example, it may only make sense
 * for nouns to have a noun class.
 * 
 * In addition to custom fields encapsulated by this type, definitions have a
 * few non-configurable built-in fields, including the description and the part
 * of speech. These cannot be enumerated in the same way as custom fields.
 */
export type Field = {
  /**
   * The globally unique ID of the field.
   */
  id: FieldId;
  /**
   * The display name of the field.
   */
  name: string;
  /**
   * An abbreviated version of the field's `name`. If this is the empty string,
   * then the field has no abbreviated name.
   */
  nameAbbr: string;
  /**
   * The type of the field's value, which determines what data can be stored in
   * the field once attached to a definition.
   */
  valueType: FieldValueType;
  /**
   * The possible values the field can take, if the field is of a list type
   * (`FIELD_LIST_ONE`, `FIELD_LIST_MANY`). For other field types, this value is
   * always null.
   */
  listValues: FieldValue[] | null;
  /**
   * The parts of speech that the field can be added to. If this value is null,
   * then the field can be added to definitions of any part of speech. Note that
   * the empty list means the field cannot be added to any definition. The empty
   * list can only result from previously selected parts of speech being deleted;
   * it is not possible to explicitly set a field filter to the empty list.
   * 
   * Newly added parts of speech will *not* be automatically added to this list,
   * even if the field selects all parts of speech. Fields are universal *only*
   * if this value is null.
   */
  partsOfSpeech: PartOfSpeech[] | null;
  /**
   * The language that the field belongs to.
   */
  language: Language;
};

/**
 * Represents a field ID.
 */
export type FieldId = IdOf<'Field'>;

/**
 * A field value is one of a set of pre-defined options that can be assigned to
 * a definition. Only fields of a list type (`FIELD_LIST_ONE`, `FIELD_LIST_MANY`)
 * contain `FieldValue`s.
 */
export type FieldValue = {
  /**
   * The globally unique ID of the field value.
   */
  id: FieldValueId;
  /**
   * The full field value text.
   */
  value: string;
  /**
   * An abbreviated version of the `value`. If this is the empty string, then the
   * field value has no abbreviated form.
   */
  valueAbbr: string;
  /**
   * The field that the value belongs to.
   */
  field: Field;
};

/**
 * A duplicated field value as returned by failed validation.
 */
export type FieldValueDuplicate = {
  /**
   * The field value *after* normalization. Normalization at minimum involves
   * trimming leading and trailing white space, but may include more steps in
   * the future.
   */
  normalizedValue: string;
  /**
   * The indices of all occurrences of the value. Since normalization is performed
   * on input values, `normalizedValue` may not match any item in the input, and
   * this list of indices can be used to locate the inputs that failed validation.
   */
  indices: number[];
};

/**
 * Represents ID of a field value.
 */
export type FieldValueId = IdOf<'FieldValue'>;

/**
 * Input type for field values as edited through `addField` or `editField`.
 * 
 * Other input types for field values are:
 * 
 * * `NewFieldValueInput`, used by `addFieldValue`
 * * `EditFieldValueInput`, used by `editFieldValue`
 */
export type FieldValueInput = {
  /**
   * The ID of the field value. When editing a field value, set to an existing ID
   * to indicate an update of that value. If null, represents a newly added field
   * value. When adding a new field, the ID is ignored.
   */
  id?: FieldValueId | null;
  /**
   * The full field value text.
   */
  value: string;
  /**
   * An abbreviated version of the `value`. If this is the empty string, then the
   * field value has no abbreviated form.
   */
  valueAbbr: string;
};

/**
 * The type of a field's value.
 */
export type FieldValueType =
  /**
   * The field contains a boolean value (on/off, true/false, yes/no).
   */
  | 'FIELD_BOOLEAN'
  /**
   * The field contains a single value selected from a list of values.
   */
  | 'FIELD_LIST_ONE'
  /**
   * The field contains zero or more values selected from a list of values.
   */
  | 'FIELD_LIST_MANY'
  /**
   * The field contains plain (unformatted) text.
   */
  | 'FIELD_PLAIN_TEXT'
;

/**
 * The result of `Mutation.validateFieldValues`. See that field for details.
 */
export type FieldValueValidity = {
  /**
   * True if the set of field values is valid.
   */
  valid: boolean;
  /**
   * If validation failed, contains indices of values that were invalid. The list
   * may be empty.
   * 
   * If validation succeeded, this field is always null.
   */
  invalid: number[] | null;
  /**
   * If validation failed, contains values occur more than once but are otherwise
   * valid. The list may be empty.
   * 
   * If validation succeeded, this field is always null.
   */
  duplicates: FieldValueDuplicate[] | null;
};

/**
 * Formatted text content. These appear as children of block elements, either
 * directly in the `inlines` list, or indirectly inside links (see `LinkInline`).
 */
export type FormattedText = {
  /**
   * The formatted text.
   */
  text: string;
  /**
   * True if the text is bold.
   */
  bold: boolean;
  /**
   * True if the text is italicized.
   */
  italic: boolean;
  /**
   * True if the text is underlined.
   */
  underline: boolean;
  /**
   * True if the text is struck through.
   */
  strikethrough: boolean;
  /**
   * True if the text is formatted as subscript characters.
   * 
   * `subscript` and `superscript` are mutually exclusive.
   */
  subscript: boolean;
  /**
   * True if the text is formatted as superscript characters.
   * 
   * `subscript` and `superscript` are mutually exclusive.
   */
  superscript: boolean;
};

/**
 * Input type for a piece of formatted text.
 */
export type FormattedTextInput = {
  /**
   * The formatted text.
   */
  text: string;
  /**
   * If true, the text is bold.
   */
  bold?: boolean | null;
  /**
   * If true, the text is italicized.
   */
  italic?: boolean | null;
  /**
   * If true, the text is underlined.
   */
  underline?: boolean | null;
  /**
   * If true, the text is struck through.
   */
  strikethrough?: boolean | null;
  /**
   * If true, the text is formatted as subscript characters.
   * 
   * `subscript` and `superscript` are mutually exclusive.
   */
  subscript?: boolean | null;
  /**
   * If true, the text is formatted as superscript characters.
   * 
   * `subscript` and `superscript` are mutually exclusive.
   */
  superscript?: boolean | null;
};

/**
 * Contains search parameters for the `search` field on the root query type. See
 * that field for more documentation and examples.
 */
export type GlobalSearchParams = {
  /**
   * The free text search query.
   */
  query: string;
  /**
   * The scopes to search within. This specifies the kinds of resources that will
   * be included in the search. Others filters may additionally limit the search
   * scope. For example, a part of speech filter will further constrain the search
   * to resources that have to a part of speech.
   * 
   * If omitted or null, all scopes are searched. If empty, no scopes are searched;
   * the result will be empty.
   */
  scopes?: SearchScope[] | null;
  /**
   * The IDs of languages to search in. This limits the search to resources that
   * belong to a language (parts of speech, lemmas and definitions). Notably, this
   * *excludes* languages themselves.
   * 
   * A parts of speech, lemma or definition matches if it belongs to *any* of the
   * specified languages.
   * 
   * If omitted or null, no language filter is applied. If empty, no languages are
   * searched; the result will be empty.
   */
  inLanguages?: LanguageId[] | null;
  /**
   * The IDs of parts of speech to search in. This limits the search to resources
   * that have a part of speech (lemmas and definitions). Notably, this *excludes*
   * parts of speech themselves.
   * 
   * A definition matches if it belongs to *any* of the specified parts of speech.
   * A lemma matches if *any* of its definitions match.
   * 
   * If omitted or null, no part of speech filter is applied. If empty, no parts
   * of speech are searched; the result will be empty.
   */
  inPartsOfSpeech?: PartOfSpeechId[] | null;
  /**
   * The IDs of tags to search in. This limits the search to resources that have
   * tags (lemmas and definitions). Notably, this *excludes* tags themselves.
   * 
   * The value of `tagMatching` determines how these values are used:
   * 
   * * If `tagMatching` is `MATCH_ANY`, then: a definition matches if it has *any*
   *   of the specified tags, and a lemma matches if *any* of its definitions
   *   match. In this mode, an empty list means no tags are searched; the result
   *   will be empty.
   * * If `tagMatching` is `MATCH_ALL`, then: a definition matches if it has *all*
   *   of the specified tags, and a lemma matches if its definitions together have
   *   *all* of the speciifed tags. In this mode, an empty list means all lemmas
   *   and definitions match (`[]` is a subset of every list).
   * 
   * If omitted or null, no tag filter is applied.
   */
  withTags?: TagId[] | null;
  /**
   * Determines how `withTags` matches. See the documentation of `withTags` for
   * more details. If omitted or null, the default value is `MATCH_ANY`.
   * 
   * This field has no effect if `withTags` is omitted or null.
   */
  tagMatching?: MatchingMode | null;
};

/**
 * The result of a global search (the `search` field on the root query type).
 */
export type GlobalSearchResult =
  | LanguageSearchResult
  | LemmaSearchResult
  | DefinitionSearchResult
  | PartOfSpeechSearchResult
  | TagSearchResult;

/**
 * Contains paginated results from the `Query.search` field.
 */
export type GlobalSearchResultConnection = {
  /**
   * Pagination metadata for this batch.
   */
  page: PageInfo;
  /**
   * The search results in this batch.
   */
  nodes: GlobalSearchResult[];
};

/**
 * A single inflected form. Each form belongs to exactly one table.
 * 
 * An inflected form has an _inflection pattern_, which describes how to construct
 * the form when applied to a word. Inflection patterns contain placeholders inside
 * curly brackets, such as `{Plural root}`, which are replaced by the definition's
 * stems. See `Definition.stems` and `DefinitionStem` for more.
 * 
 * In addition to this, the `deriveLemma` field determines whether the inflected
 * form, once computed for a word, is added to the dictionary as its own lemma.
 * This enables the dictionary to list e.g. "birds" as the plural of "bird". This
 * feature can be disabled or enabled for each individual form.
 * 
 * Finally, every inflected form has a name. Usually inflected form names are
 * derived from the inflection table's header cells, but the user can also enter
 * a custom name. The `hasCustomDisplayName` field indicates whether the name was
 * derived automatically. The display name is used for derived definitions, so the
 * dictionary can show "birds" as the _plural_ of "bird", not merely a generic
 * _inflected form of_.
 */
export type InflectedForm = {
  /**
   * The globally unique ID of the inflected form.
   */
  id: InflectedFormId;
  /**
   * Whether the inflected form is automatically added to the dictionary.
   */
  deriveLemma: boolean;
  /**
   * A pattern, such as '{~}s', which describes how to construct the inflected form.
   */
  inflectionPattern: string;
  /**
   * The display name of the inflected form.
   */
  displayName: string;
  /**
   * If true, `displayName` is a custom, user-entered name, as opposed to being
   * derived automatically from header cells in the parent `inflectionTable`.
   * 
   * Note that the display name is stored pre-computed regardless of this setting;
   * the server does not compute automatic display names for each request.
   */
  hasCustomDisplayName: boolean;
  /**
   * The table layout that this form belongs to.
   */
  inflectionTableLayout: InflectionTableLayout;
};

/**
 * Represents an inflected form ID.
 */
export type InflectedFormId = IdOf<'InflectedForm'>;

/**
 * Input type for an inflected form. This type is used for both new and existing
 * forms.
 */
export type InflectedFormInput = {
  /**
   * The ID of the inflected form. In a new table, this property is ignored. When
   * editing an existing table, if set, it will update an existing form.
   */
  id?: InflectedFormId | null;
  /**
   * Whether the inflected form is automatically added to the dictionary.
   */
  deriveLemma: boolean;
  /**
   * A pattern, such as `{~}s`, which describes how to construct the inflected
   * form.
   */
  inflectionPattern: string;
  /**
   * The display name of the inflected form.
   */
  displayName: string;
  /**
   * Determines whether the display name was entered specifically by the user. If
   * false, the display name was derived automatically from the header cells in
   * the containing table.
   * 
   * Note that `displayName` must be set regardless of the value of this field.
   * The server does not compute any display names.
   */
  hasCustomDisplayName: boolean;
};

/**
 * An inflection table defines how to inflect definitions. The table is a true
 * 2-dimensional table, not merely a list of forms. As such, it can contain any
 * number of rows and columns, and some cells may be headers. Cells can span
 * multiple rows and columns.
 * 
 * To access the contents of an inflection table, query the `layout` field. Through
 * it, you can read the table's rows and cells to construct the table, fetch the
 * inflected forms (see `InflectedForm`) that are contained in the table, as well
 * as query the definitions that use the table layout.
 * 
 * ## Historical layouts
 * 
 * If you change the layout of a table that is used by one or more definitions, the
 * previous layout may be kept. The precise conditions are not specified here, but
 * the rule of thumb is this: if the new layout would cause derived forms to be
 * added, edited or removed, the old layout is kept.
 * 
 * Historical layouts are saved in order to prevent potential dictionary-wide
 * alterations:
 * 
 * 1. Inflected forms may be added to the dictionary (see `InflectedForm`), and
 *    recalculating new forms for every definition that uses a table may be costly.
 * 2. It is exceedingly difficult for the user to predict the effect of altering
 *    an inflection table across the entire dictionary, especially if the table is
 *    used by many definitions. By forcing the user to update definitions manually,
 *    we effectively make them check each one.
 * 
 * Old layouts are available through the `oldLayouts` field.
 */
export type InflectionTable = {
  /**
   * The globally unique ID of the inflection table.
   */
  id: InflectionTableId;
  /**
   * The name of the inflection table, which is only shown in the admin UI.
   */
  name: string;
  /**
   * Describes the current layout of the inflection table.
   * 
   * This table may have any number of old layouts that are still in use by one or
   * more definitions. These can be accessed through `oldLayouts`.
   */
  layout: InflectionTableLayout;
  /**
   * Gets old layouts of the inflection table that are still used by at least one
   * definition (query through the `InflectionTableLayout.usedByDefinitions` field).
   * Old layouts are ordered from oldest to newest.
   * 
   * Since there may be many old layouts, this field is always paginated. If
   * provided, `page.perPage` cannot exceed 200.
   */
  oldLayouts: WithArgs<{
    page?: PageParams | null;
  }, InflectionTableLayoutConnection>;
  /**
   * The language that this inflection table belongs to.
   */
  language: Language;
  /**
   * Indicates whether any version of the inflection table is currently used by any
   * definitions.
   * 
   * To get the definitions that use this table, see the `usedByDefinitions` field.
   */
  isInUse: boolean;
  /**
   * Gets the definitions that use any version of this table.
   * 
   * Definitions are ordered by term first, by ID second. If any definitions belong
   * to the same lemma, they will appear in the same relative order as they would
   * on the `Lemma.definitions` field.
   * 
   * Since the table may be used by many definitions, this field is always
   * paginated. If provided, `page.perPage` cannot exceed 200.
   */
  usedByDefinitions: WithArgs<{
    page?: PageParams | null;
    layout?: LayoutVersionFilter | null;
  }, DefinitionUsingInflectionTableConnection>;
  /**
   * The time that the inflection table was created.
   */
  timeCreated: UtcInstant;
  /**
   * The time of the most recent update to the inflection table. This time covers
   * updates performed on the table itself or on its layout.
   */
  timeUpdated: UtcInstant;
};

/**
 * A single cell in an inflection table. All inflection table cells have a column
 * span and a row span, both of which are guaranteed to be greater than zero.
 */
export type InflectionTableCell =
  | InflectionTableHeaderCell
  | InflectionTableDataCell;

/**
 * Input type for an inflection table cell. This type combines header cells and
 * inflected forms, and is used for both new and existing tables.
 */
export type InflectionTableCellInput = {
  /**
   * The column span of the cell. The value must be greater than 0. If omitted,
   * defaults to 1.
   */
  columnSpan?: number | null;
  /**
   * The row span of the cell. The value must be greater than 0. If omitted,
   * defaults to 1.
   */
  rowSpan?: number | null;
  /**
   * The text displayed in the header cell. If this field is set, the cell is a
   * header.
   */
  headerText?: string | null;
  /**
   * The inflected form displayed in the cell. If this field is set, the cell is
   * a data cell. In a new table, the cell's `id` property is ignored.
   */
  inflectedForm?: InflectedFormInput | null;
};

/**
 * An cell in an inflection table that contains an inflected form. See the related
 * type `InflectedForm` for details.
 */
export type InflectionTableDataCell = {
  /**
   * The column span of the cell. The value is always greater than 0.
   */
  columnSpan: number;
  /**
   * The row span of the cell. The value is always greater than 0.
   */
  rowSpan: number;
  /**
   * The inflected form displayed in the cell.
   */
  inflectedForm: InflectedForm;
};

/**
 * A header cell in an inflection table. Header cells contain only a bit of text,
 * with no formatting.
 */
export type InflectionTableHeaderCell = {
  /**
   * The column span of the cell. The value is always greater than 0.
   */
  columnSpan: number;
  /**
   * The row span of the cell. The value is always greater than 0.
   */
  rowSpan: number;
  /**
   * The text displayed in the header cell.
   */
  headerText: string;
};

/**
 * Represents an inflection table ID.
 */
export type InflectionTableId = IdOf<'InflectionTable'>;

/**
 * An inflection table layout describes the rows, columns and inflected forms that
 * make up an inflection table. A layout may be current or historical; see the
 * documentation of `InflectionTable` for details.
 */
export type InflectionTableLayout = {
  /**
   * The globally unique ID of this inflection table layout.
   */
  id: InflectionTableLayoutId;
  /**
   * Indicates whether this layout is the current layout used by the parent
   * inflection table.
   */
  isCurrent: boolean;
  /**
   * Contains the rows of the inflection table. Each row contains a number of
   * cells; each cell is either a header or an inflected form.
   */
  rows: InflectionTableRow[];
  /**
   * All inflected forms contained in the table. To get a form's position in the
   * table, you must access the data through `rows`.
   */
  inflectedForms: InflectedForm[];
  /**
   * A list of unique stem names that appear in the inflection patterns of this
   * table. The items in the list are unsorted.
   */
  stems: string[];
  /**
   * The inflection table that this layout belongs to.
   */
  inflectionTable: InflectionTable;
  /**
   * Indicates whether this layout is used by any definitions.
   * 
   * To get the definitions that use this table, see the `usedByDefinitions` field.
   */
  isInUse: boolean;
  /**
   * Gets the definitions that use this layout.
   * 
   * Definitions are ordered by term first, by ID second. If any definitions belong
   * to the same lemma, they will appear in the same relative order as they would
   * on the `Lemma.definitions` field.
   * 
   * Since the table may be used by many definitions, this field is always
   * paginated. If provided, `page.perPage` cannot exceed 200.
   */
  usedByDefinitions: WithArgs<{
    page?: PageParams | null;
  }, DefinitionConnection>;
};

/**
 * Contains paginated results from the `InflectionTable.oldLayouts` field.
 */
export type InflectionTableLayoutConnection = {
  /**
   * Pagination metadata for this batch.
   */
  page: PageInfo;
  /**
   * The inflection table layouts in this batch.
   */
  nodes: InflectionTableLayout[];
};

/**
 * Represents an inflection table layout ID.
 */
export type InflectionTableLayoutId = IdOf<'InflectionTableLayout'>;

/**
 * A single row in an inflection table.
 * 
 * This is a record type to allow future extensions without breaking backwards
 * compatibility.
 */
export type InflectionTableRow = {
  /**
   * Header and data cells of the table.
   */
  cells: InflectionTableCell[];
};

/**
 * Input type for an inflection table row. This type is used for both new and
 * existing tables.
 */
export type InflectionTableRowInput = {
  /**
   * Header and data cells of the table.
   */
  cells: InflectionTableCellInput[];
};

/**
 * An inline element, which is either formatted text or a link.
 */
export type InlineElement =
  | FormattedText
  | LinkInline;

/**
 * Input type for an inline element.
 */
export type InlineElementInput = {
  /**
   * If set, the inline element is a piece of formatted text, and this field
   * contains the text and its associated formatting.
   * 
   * `text` and `linkTarget` are mutually exclusive.
   */
  text?: FormattedTextInput | null;
  /**
   * If set, the inline element is a link, and this field contains the link target
   * and its formatted text content.
   */
  link?: LinkInlineInput | null;
};

/**
 * Contains the item that an internal link points to.
 */
export type InternalLinkTarget =
  | LanguageLinkTarget
  | LemmaLinkTarget
  | DefinitionLinkTarget
  | PartOfSpeechLinkTarget;

/**
 * The language is the root of the dictionary. Everything else in the dictionary
 * belongs, directly or indirectly, to a language. A dictionary can contain any
 * number of languages.
 * 
 * A language contains:
 * 
 * * Parts of speech (see `PartOfSpeech`), which words can be associated with.
 * * Inflection tables (see `InflectionTable`), which specifies how definitions
 *   inflect.
 * * Lemmas (see `Lemma`), which are basically the words of the dictionary. Each
 *   lemma can contain any number of definitions (see `Definition`). Lemmas should
 *   have been called _headwords_.
 * 
 * In addition, every language has a (unique) name, an optional description, and
 * various metadata.
 */
export type Language = {
  /**
   * The globally unique ID of the language.
   */
  id: LanguageId;
  /**
   * The display name of the language.
   */
  name: string;
  /**
   * Formatted text that provides a description of the language.
   */
  description: BlockElement[];
  /**
   * The parts of speech that belong to this language.
   */
  partsOfSpeech: PartOfSpeech[];
  /**
   * Finds a part of speech by name.
   */
  partOfSpeechByName: WithArgs<{
    name: string;
  }, PartOfSpeech | null>;
  /**
   * The inflection tables that belong to this language.
   */
  inflectionTables: InflectionTable[];
  /**
   * Finds an inflection table by name.
   */
  inflectionTableByName: WithArgs<{
    name: string;
  }, InflectionTable | null>;
  /**
   * The custom fields defined in this language.
   */
  fields: Field[];
  /**
   * Finds a field by name.
   */
  fieldByName: WithArgs<{
    name: string;
  }, Field | null>;
  /**
   * The total number of lemmas in the dictionary.
   */
  lemmaCount: number;
  /**
   * The lemmas defined in the dictionary. Since a language usually contains many
   * lemmas, this field is always paginated. If provided, `page.perPage` cannot
   * exceed 500.
   */
  lemmas: WithArgs<{
    page?: PageParams | null;
    filter?: LemmaFilter | null;
  }, LemmaConnection>;
  /**
   * The first lemma in the language, ordered alphabetically. If the language has
   * no lemmas, this field is null.
   */
  firstLemma: Lemma | null;
  /**
   * The last lemma in the language, ordered alphabetically. If the language has no
   * lemmas, this field is null.
   */
  lastLemma: Lemma | null;
  /**
   * The tags used by this language. Since a language may use many tags, this field
   * is always paginated. If provided, `page.perPage` cannot exceed 200.
   */
  tags: WithArgs<{
    page?: PageParams | null;
  }, TagConnection>;
  /**
   * Lists recently changed definitions. The results can be sorted by creation date
   * or by last update/edit date.
   * 
   * The `order` parameter determines the sort order. If omitted or null, defaults
   * to MOST_RECENTLY_UPDATED.
   * 
   * Since a language may contain many definitions, this field is always paginated.
   * If provided, `page.perPage` cannot exceed 100.
   */
  recentDefinitions: WithArgs<{
    page?: PageParams | null;
    order?: RecentItemOrder | null;
  }, DefinitionConnection>;
  /**
   * Searches the language. This field behaves like `Query.search` with an implicit
   * language filter. See that field for more documentation and examples.
   * 
   * The following are equivalent:
   * 
   * ```graphql
   * query($language: LanguageId!) {
   *   language(id: $language) {
   *     # This search:
   *     search(params: {
   *       query: "foo"
   *     }) {
   *       ...
   *     }
   *   }
   * 
   *   # is equivalent to:
   *   search(params: {
   *     query: "foo"
   *     inLanguages: [$language]
   *   }) {
   *     ...
   *   }
   * }
   * ```
   * 
   * But note that `Language.search` returns a different type that includes only
   * those resources that are searchable in languages.
   */
  search: WithArgs<{
    params: SearchInLanguageParams;
    page?: PageParams | null;
  }, SearchInLanguageResultConnection | null>;
  /**
   * The time that the language was created.
   */
  timeCreated: UtcInstant;
  /**
   * The time of the most recent update to the language. This time coers updates
   * performed on the language itself, but not on any of its subresources (such as
   * parts of speech, inflection tables or definitions).
   */
  timeUpdated: UtcInstant;
  /**
   * Assorted statistics about the language.
   */
  statistics: LanguageStats;
};

/**
 * Represents a language ID.
 */
export type LanguageId = IdOf<'Language'>;

/**
 * Contains the language that a language link points to.
 */
export type LanguageLinkTarget = {
  /**
   * The ID of the language that the link points to.
   */
  id: LanguageId;
  /**
   * The language pointed to by the link. If the language has been removed since
   * the link was created, this field is null.
   */
  language: Language | null;
};

/**
 * A search result that matches a language.
 */
export type LanguageSearchResult = {
  /**
   * A snippet over the matching part of the language name.
   */
  nameSnippet: MatchingSnippet;
  /**
   * The language that matched the search.
   */
  language: Language;
};

/**
 * Contains statistics about a language.
 */
export type LanguageStats = {
  /**
   * The total number of lemmas in the language.
   */
  lemmaCount: number;
  /**
   * The total number of (non-derived) definitions in the language.
   */
  definitionCount: number;
  /**
   * The number of parts of speech in the language.
   */
  partOfSpeechCount: number;
  /**
   * The number of unique tags used by definitions in the language.
   */
  tagCount: number;
};

/**
 * Determines which table layout versions to consider when looking up definitions
 * that use a particular inflection table.
 */
export type LayoutVersionFilter =
  /**
   * Include definitions that use *any* version of the table.
   */
  | 'ALL_LAYOUTS'
  /**
   * Include only definitions that contain at least one instance of the *current*
   * version of the table.
   * 
   * Note: Definitions can have multiple instances of the same table, and they do
   * not all need to be the same version (tables are upgraded separately). Hence,
   * even with this filter, definitions may be included that use an older layout.
   */
  | 'CURRENT_LAYOUT'
  /**
   * Include only definitions that contain at least one instance of an old layout.
   * 
   * Note: Definitions can have multiple instances of the same table, and they do
   * not all need to be the same version (tables are upgraded separately). Hence,
   * even with this filter, definitions may be included that use the current
   * layout.
   */
  | 'OLD_LAYOUTS'
;

/**
 * A _lemma_ is a word listed in a dictionary. A lemma contains one or more
 * _definitions_, which, as the name imply, actually define the lemma. The lemma
 * itself only serves to group definitions.
 * 
 * Lemmas are managed automatically. The dictionary's lemmas are edited indirectly
 * by changing the definitions contained in them.
 */
export type Lemma = {
  /**
   * The globally unique ID of the lemma.
   */
  id: LemmaId;
  /**
   * The term that the lemma defines; the dictionary form of the word, e.g.
   * _lizard_ or _green_.
   */
  term: string;
  /**
   * Definitions that belong to the lemma. This list contains only "direct"
   * definitions, not definitions derived from inflecting other words.
   */
  definitions: Definition[];
  /**
   * Definitions that are derived from inflecting another definition, e.g.
   * _lizards_ as the plural of _lizard_, or _greener_ as the comparative of
   * _green_.
   */
  derivedDefinitions: DerivedDefinition[];
  /**
   * Combined set of all tags associated with all definitions in the lemma.
   */
  tags: Tag[];
  /**
   * The language that the lemma belongs to.
   */
  language: Language;
};

/**
 * Contains paginated results from the `Language.lemmas` field.
 */
export type LemmaConnection = {
  /**
   * Pagination metadata for this batch.
   */
  page: PageInfo;
  /**
   * The lemmas in this batch.
   */
  nodes: Lemma[];
};

/**
 * Contains filtering options for lemmas.
 */
export type LemmaFilter = {
  /**
   * Determines which kind of lemmas to include. See the `LemmaKind` enum for
   * details.
   */
  kind?: LemmaKind | null;
  /**
   * If specified, restricts the lemma list to lemmas where a definition belongs
   * to one of the given parts of speech.
   * 
   * For direct definitions (those in `Lemma.definitions`), the lemma matches if
   * at least one definition belongs to one of the specified parts of speech. For
   * derived definitions (in `Lemma.derivedDefinitions`), the lemma matches if
   * the derived definition comes from an original definition of the specified
   * part of speech.
   * 
   * If this parameter is the empty list, no lemmas are returned.
   */
  inPartsOfSpeech?: PartOfSpeechId[] | null;
  /**
   * If specified, restricts the lemma list to lemmas where a definition uses one
   * of the given inflection tables.
   * 
   * For direct definitions (those in `Lemma.definitions`), the lemma matches if
   * at least one definition uses one of the specified inflection tables. For
   * derived definitions (in `Lemma.derivedDefinitions`), the lemma matches if
   * the derived definition comes from an inflected form in one of the specified
   * tables.
   * 
   * If this parameter is the empty list, no lemmas are returned.
   */
  inflectsLike?: InflectionTableId[] | null;
  /**
   * If specified, restricts the lemma list to lemmas where a definition contains
   * any or all (depending on `tagMatching`) of the given tags.
   * 
   * The value of `tagMatching` determines how these values are used:
   * 
   * * If `tagMatching` is `MATCH_ANY`, then a lemma is included if one of its
   *   definitions has *any* of the specified tags. In this mode, an empty list
   *   means nothing matches; the lemma list will be empty.
   * * If `tagMatching` is `MATCH_ALL`, then a lemma is included if one of its
   *   definitions taken together have *all* of the specified tags. In this mode,
   *   an empty list means all lemmas match (`[]` is a subset of every list).
   * 
   * When filtering by tag, only direct definitions (those in `Lemma.definitions`)
   * are considered. Derived definitions (in `Lemma.derivedDefinitions`) are not
   * included in the search.
   * 
   * Note: if tags are specified and `kind` is `DERIVED_LEMMAS_ONLY`, the lemma
   * list will be empty.
   * 
   * If omitted or null, no tag filter is applied.
   */
  withTags?: TagId[] | null;
  /**
   * Determines how `withTags` matches. See the documentation of `withTags` for
   * more details. If omitted or null, the default value is `MATCH_ANY`.
   * 
   * This field has no effect if `withTags` is omitted or null.
   */
  tagMatching?: MatchingMode | null;
};

/**
 * Represents a lemma ID.
 */
export type LemmaId = IdOf<'Lemma'>;

/**
 * Determines which kind of lemmas to include.
 */
export type LemmaKind =
  /**
   * All lemmas are included in the result.
   */
  | 'ALL_LEMMAS'
  /**
   * Include only lemmas that have at least one own definition (that is, where
   * `Lemma.definitions` is not the empty list).
   */
  | 'DEFINED_LEMMAS_ONLY'
  /**
   * Include only lemmas that have at least one derived definition (that is, where
   * `Lemma.derivedDefinitions` is not the empty list).
   */
  | 'DERIVED_LEMMAS_ONLY'
;

/**
 * Contains the lemma that a lemma link points to.
 */
export type LemmaLinkTarget = {
  /**
   * The ID of the lemma that the link points to.
   */
  id: LemmaId;
  /**
   * The lemma pointed to by the link. If the lemma has been removed since the
   * link was created, this field is null.
   */
  lemma: Lemma | null;
};

/**
 * A search result that matches a lemma.
 */
export type LemmaSearchResult = {
  /**
   * A snippet over the matching part of the lemma name.
   */
  termSnippet: MatchingSnippet;
  /**
   * The lemma that matched the search.
   */
  lemma: Lemma;
};

/**
 * An inline element that represents a link, either to an item in the dictionary,
 * or to an arbitrary external URI. Link elements may not contain other links.
 */
export type LinkInline = {
  /**
   * The target of the link. The link target can either be an external link, in
   * which case this field contains a fully qualified HTTP or HTTPS URL, such as
   * `https://example.com`, or an internal links using the pseudo-protocol
   * `condict:` as follows:
   * 
   * * `condict://language/{id}` links to the start page of a language.
   * * `condict://lemma/{id}` links to a lemma.
   * * `condict://definition/{id}` links to a definition.
   * * `condict://part-of-speech/{id}` links to a part of speech.
   */
  linkTarget: string;
  /**
   * If the link leads to an item in the dictionary, contains that item. Otherwise,
   * this field is null.
   */
  internalLinkTarget: InternalLinkTarget | null;
  /**
   * A list of formatted text parts that make up the link's text. Note that links
   * are not permitted here.
   */
  inlines: FormattedText[];
};

/**
 * Input type for a link inline element.
 */
export type LinkInlineInput = {
  /**
   * Contains the target of the link. For details, see `LinkInline.linkTarget`.
   */
  linkTarget: string;
  /**
   * A list of formatted text parts that make up the link's text. Note that links
   * are not permitted here.
   */
  inlines: FormattedTextInput[];
};

/**
 * Describes why a login failed.
 */
export type LoginFailureReason =
  /**
   * The user could not be found.
   */
  | 'USER_NOT_FOUND'
  /**
   * The password did not match.
   */
  | 'PASSWORD_MISMATCH'
;

/**
 * Represents the result of a login attempt.
 */
export type LoginResult =
  | UserSession
  | FailedLogin;

/**
 * Represents the marshalling type of a custom scalar. See the documentation of
 * the `@marshal` directive.
 */
export type MarshalType =
  /**
   * The type is marshalled as an integer. In the JSON payload, it is a numeric
   * value with no fractional component. In queries, the type accepts integer
   * literals. The TypeScript representation is `number`.
   */
  | 'INT_TYPE'
  /**
   * The type is marshalled as a floating-point value. In the JSON payload, it is
   * a numeric value with an optional fractional component. In queries, the type
   * accepts integer and floating-point literals. The TypeScript representation
   * is `number`.
   */
  | 'FLOAT_TYPE'
  /**
   * The type is marshalled as a string value. In the JSON payload, it is a string.
   * In queries, the type accepts string literals. The TypeScript representation
   * is `string`.
   */
  | 'STRING_TYPE'
;

/**
 * Determines the matching mode of some filterable values.
 */
export type MatchingMode =
  /**
   * Specifies that the filtered field must match *at least one* of the provided
   * values.
   */
  | 'MATCH_ANY'
  /**
   * Specifies that the filtered field must match *all* of the provided values.
   */
  | 'MATCH_ALL'
;

/**
 * This type encapsulates the part of a searchable text field that matched a query,
 * along with a small amount of surrounding context. The surrounding content is
 * usually a subset of the the searchable field's text, but may be large enough to
 * include the full text. This type is used for highlighting where a search query
 * matched a field.
 * 
 * Values of this type are not guaranteed to contain every single matching search
 * query token.
 */
export type MatchingSnippet = {
  /**
   * If true, the snippet starts before the searched field's text; that is, there
   * exists field text before the first value in `parts`. If false, the `parts`
   * list contains the start of the searched text.
   * 
   * When this field is true, a highlighted snippet should probably start with a
   * marker to indicate partial content, such as `...`.
   */
  partialStart: boolean;
  /**
   * If true, the snippet ends before the searched field's text; that is, there
   * exists field text after the last value in `parts`. If false, the `parts list
   * contains the end of the searched text.
   * 
   * When this field is true, a highlighted snippet should probably end with a
   * marker to indicate partial content, such as `...`.
   */
  partialEnd: boolean;
  /**
   * Text extracted from the searched field. This list contains the parts that
   * matched the search query as well as surrounding context.
   */
  parts: MatchingSnippetPart[];
};

/**
 * A part of a `MatchingSnippet`, which is either a match for a token from the
 * search query, or surrounding text extracted from the searched field. See the
 * `MatchingSnippet` type for more details.
 */
export type MatchingSnippetPart = {
  /**
   * True if the part is a search query match; false if it is surrounding context.
   */
  isMatch: boolean;
  /**
   * Text from the searched field.
   */
  text: string;
};

/**
 * The root mutation type.
 */
export type Mutation = {
  /**
   * Adds a definition to the dictionary. The lemma is automatically created based
   * on the `term`: if there is a lemma with that term, the definition is added to
   * it; otherwise, a lemma is created.
   * 
   * Requires authentication.
   */
  addDefinition: WithArgs<{
    data: NewDefinitionInput;
  }, Definition | null>;
  /**
   * Edits an existing definition.
   * 
   * Requires authentication.
   */
  editDefinition: WithArgs<{
    id: DefinitionId;
    data: EditDefinitionInput;
  }, Definition | null>;
  /**
   * Deletes a definition.
   * 
   * Requires authentication.
   */
  deleteDefinition: WithArgs<{
    id: DefinitionId;
  }, boolean | null>;
  /**
   * Adds a field to the dictionary.
   * 
   * Requires authentication.
   */
  addField: WithArgs<{
    data: NewFieldInput;
  }, Field | null>;
  /**
   * Edits an existing field.
   * 
   * Requires authentication.
   */
  editField: WithArgs<{
    id: FieldId;
    data: EditFieldInput;
  }, Field | null>;
  /**
   * Deletes a field. This will delete all values associated with the field, as
   * well as delete it from every definition that uses it.
   * 
   * Requires authentication.
   */
  deleteField: WithArgs<{
    id: FieldId;
  }, boolean | null>;
  /**
   * Validates a set of field values to find invalid values and duplicates. This
   * mutation can be used for pre-validation before submitting field data for
   * `addField` or `editField`.
   * 
   * This mutation does not actually update the database.
   * 
   * Requires authentication.
   */
  validateFieldValues: WithArgs<{
    values: string[];
  }, FieldValueValidity>;
  /**
   * Adds a value to a list-type field.
   * 
   * Requires authentication.
   */
  addFieldValue: WithArgs<{
    data: NewFieldValueInput;
  }, FieldValue | null>;
  /**
   * Edits an existing value of a list-type field.
   * 
   * Requires authentication.
   */
  editFieldValue: WithArgs<{
    id: FieldValueId;
    data: EditFieldValueInput;
  }, FieldValue | null>;
  /**
   * Deletes a value from a field. This will also delete the value from every
   * definition that uses it.
   * 
   * Requires authentication.
   */
  deleteFieldValue: WithArgs<{
    id: FieldValueId;
  }, boolean | null>;
  /**
   * Adds an inflection table.
   * 
   * Requires authentication.
   */
  addInflectionTable: WithArgs<{
    data: NewInflectionTableInput;
  }, InflectionTable | null>;
  /**
   * Edits an inflection table.
   * 
   * Requires authentication.
   */
  editInflectionTable: WithArgs<{
    id: InflectionTableId;
    data: EditInflectionTableInput;
  }, InflectionTable | null>;
  /**
   * Deletes an inflection table. It is not possible to delete a table that is used
   * by one or more definitions.
   * 
   * Requires authentication.
   */
  deleteInflectionTable: WithArgs<{
    id: InflectionTableId;
  }, boolean | null>;
  /**
   * Adds a language.
   * 
   * Requires authentication.
   */
  addLanguage: WithArgs<{
    data: NewLanguageInput;
  }, Language | null>;
  /**
   * Edits a language.
   * 
   * Requires authentication.
   */
  editLanguage: WithArgs<{
    id: LanguageId;
    data: EditLanguageInput;
  }, Language | null>;
  /**
   * Deletes a language.
   * 
   * Requires authentication.
   */
  deleteLanguage: WithArgs<{
    id: LanguageId;
  }, boolean | null>;
  /**
   * Adds a part of speech.
   * 
   * Requires authentication.
   */
  addPartOfSpeech: WithArgs<{
    data: NewPartOfSpeechInput;
  }, PartOfSpeech | null>;
  /**
   * Edits a part of speech.
   * 
   * Requires authentication.
   */
  editPartOfSpeech: WithArgs<{
    id: PartOfSpeechId;
    data: EditPartOfSpeechInput;
  }, PartOfSpeech | null>;
  /**
   * Deletes a part of speech. It is not possible to delete a part of speech that
   * is in use by any definition.
   * 
   * Requires authentication.
   */
  deletePartOfSpeech: WithArgs<{
    id: PartOfSpeechId;
  }, boolean | null>;
  /**
   * Attempts to log in on the server using the specified username and password.
   */
  logIn: WithArgs<{
    username: string;
    password: string;
  }, LoginResult | null>;
  /**
   * Logs out of the current session. Returns true if the session was terminated,
   * false if there is no current session.
   */
  logOut: boolean | null;
  /**
   * Tries to resume the current session. If the session exists and has not
   * expired, the expiry date is updated and the session data is returned. If
   * the current session ID refers to an expired or invalid session, null is
   * returned, and the user must log in again to edit the dictionary.
   */
  resumeSession: UserSession | null;
};

/**
 * Input type for a new definition's inflection table.
 */
export type NewDefinitionInflectionTableInput = {
  /**
   * An optional formatted text that describes the table.
   */
  caption?: TableCaptionInput | null;
  /**
   * A list of custom inflected forms, which replace forms in the table. These are
   * _generally_ irregular forms, but this is not guaranteed.
   */
  customForms: CustomInflectedFormInput[];
  /**
   * The inflection table used by the definition.
   */
  inflectionTableId: InflectionTableId;
};

/**
 * Input type for adding new definitions.
 */
export type NewDefinitionInput = {
  /**
   * The language that the definition will be added to.
   */
  languageId: LanguageId;
  /**
   * The term that this definition defines.
   * 
   * If there is no lemma for this term, it will automatically be created.
   */
  term: string;
  /**
   * The part of speech that the definition belongs to.
   */
  partOfSpeechId: PartOfSpeechId;
  /**
   * Formatted text that describes the definition.
   */
  description: BlockElementInput[];
  /**
   * Inflection stems that belong to this definition.
   */
  stems: StemInput[];
  /**
   * Inflection tables that are used by this definiton.
   */
  inflectionTables: NewDefinitionInflectionTableInput[];
  /**
   * Tags associated with this definition.
   */
  tags: string[];
  /**
   * Custom field values.
   */
  fields: DefinitionFieldInput[];
};

/**
 * Input type for adding new fields.
 */
export type NewFieldInput = {
  /**
   * The language that the field will be added to.
   */
  languageId: LanguageId;
  /**
   * The name of the new field.
   */
  name: string;
  /**
   * An abbreviated version of the field's `name`. If this is the empty string,
   * then the field has no abbreviated name.
   */
  nameAbbr: string;
  /**
   * The type of the field's value.
   */
  valueType: FieldValueType;
  /**
   * The field's values, for a list field. If the field is a list field, then this
   * cannot be null; pass an empty list to create a field with no initial values.
   * If the field is a non-list field, this value *must* be null.
   */
  listValues?: FieldValueInput[] | null;
  /**
   * The parts of speech that this field can be used in. To mark a field as usable
   * in any part of speech, even ones that are added in the future, pass the empty
   * list. It is not possible to create a field that cannot be used in any part of
   * speech.
   */
  partOfSpeechIds: PartOfSpeechId[];
};

/**
 * Input type for adding a new field value through `addFieldValue`.
 * 
 * Other input types for field values are:
 * 
 * * `FieldValueInput`, used in `NewFieldInput` and `EditFieldInput`
 * * `EditFieldValueInput`, used by `editFieldValue`
 */
export type NewFieldValueInput = {
  /**
   * The field to add the value to.
   */
  fieldId: FieldId;
  /**
   * The full field value text.
   */
  value: string;
  /**
   * An abbreviated version of the `value`. If this is the empty string, then the
   * field value has no abbreviated form.
   */
  valueAbbr: string;
};

/**
 * Input type for a new inflection table.
 */
export type NewInflectionTableInput = {
  /**
   * The language that the inflection table will be added to.
   */
  languageId: LanguageId;
  /**
   * The name of the inflection table.
   */
  name: string;
  /**
   * Describes the layout of the inflection table. Each row contains a number of
   * cells; each cell is either a header or an inflected form.
   */
  layout: InflectionTableRowInput[];
};

/**
 * Input type for a new language.
 */
export type NewLanguageInput = {
  /**
   * The display name of the language.
   */
  name: string;
  /**
   * Formatted text that provides a description of the language. If omitted or
   * null, the language has no description.
   */
  description?: BlockElementInput[] | null;
};

/**
 * Input type for a new part of speech.
 */
export type NewPartOfSpeechInput = {
  /**
   * The language that the part of speech will be added to.
   */
  languageId: LanguageId;
  /**
   * The display name of the part of speech.
   */
  name: string;
  /**
   * Formatted text that provides a description of the part of speech. If omitted
   * or null, the part of speech has no description.
   */
  description?: BlockElementInput[] | null;
};

/**
 * Contains pagination details about a batch of a paginated collection.
 */
export type PageInfo = {
  /**
   * The 0-based page number. This value is always greater than or equal to 0.
   */
  page: number;
  /**
   * The total number of items per page. This value is always at least 1.
   */
  perPage: number;
  /**
   * The total number of items in the paginated collection. This value is always
   * greater than or equal to 0.
   */
  totalCount: number;
  /**
   * Determines whether there are more items in the collection.
   */
  hasNext: boolean;
  /**
   * Determines whether there are items on earlier pages. This value is true if
   * and only if \`page\` is greater than zero.
   */
  hasPrev: boolean;
};

/**
 * Input type for pagination parameters.
 */
export type PageParams = {
  /**
   * The 0-based page number. This value cannot be less than 0.
   */
  page: number;
  /**
   * The total number of items per page. This value cannot be less than 1. Each
   * field defines its own upper limit.
   */
  perPage: number;
};

/**
 * A part of speech is associated with each word in the dictionary. It is possible
 * to search and filter definitions by part of speech, and every definition must
 * belong to a part of speech.
 */
export type PartOfSpeech = {
  /**
   * The globally unique ID of the part of speech.
   */
  id: PartOfSpeechId;
  /**
   * The display name of the part of speech.
   */
  name: string;
  /**
   * The language that the part of speech belongs to.
   */
  language: Language;
  /**
   * Formatted text that provides a description of the part of speech.
   */
  description: BlockElement[];
  /**
   * Indicates whether the part of speech is currently used by any definitions.
   * 
   * To get the definitions that use this part of speech, see the `usedByDefinitions`
   * field.
   */
  isInUse: boolean;
  /**
   * Gets the definitions that use this part of speech.
   * 
   * Definitions are ordered by term first, by ID second. If any definitions belong
   * to the same lemma, they will appear in the same relative order as they would
   * on the `Lemma.definitions` field.
   * 
   * Since the part of speech may be used by many definitions, this field is always
   * paginated. If provided, `page.perPage` cannot exceed 200.
   */
  usedByDefinitions: WithArgs<{
    page?: PageParams | null;
  }, DefinitionConnection>;
  /**
   * The time that the part of speech was created.
   */
  timeCreated: UtcInstant;
  /**
   * The time of the most recent update to the part of speech.
   */
  timeUpdated: UtcInstant;
  /**
   * Assorted statistics about a part of speech.
   */
  statistics: PartOfSpeechStats;
};

/**
 * Represents a part of speech ID.
 */
export type PartOfSpeechId = IdOf<'PartOfSpeech'>;

/**
 * Contains the part of speech that a part of speech link points to.
 */
export type PartOfSpeechLinkTarget = {
  /**
   * The ID of the part of speech that the link points to.
   */
  id: PartOfSpeechId;
  /**
   * The part of speech pointed to by the link. If the part of speech has been
   * removed since the link was created, this field is null.
   */
  partOfSpeech: PartOfSpeech | null;
};

/**
 * A search result that matches a part of speech.
 */
export type PartOfSpeechSearchResult = {
  /**
   * A snippet over the matching part of the part of speech name.
   */
  nameSnippet: MatchingSnippet;
  /**
   * The part of speech that matched the search.
   */
  partOfSpeech: PartOfSpeech;
};

/**
 * Contains statistics about a part of speech.
 */
export type PartOfSpeechStats = {
  /**
   * The total number of definitions that use the part of speech.
   */
  definitionCount: number;
};

/**
 * The root query type.
 */
export type Query = {
  /**
   * Finds a definition by ID.
   */
  definition: WithArgs<{
    id: DefinitionId;
  }, Definition | null>;
  /**
   * Finds a definition inflection table by ID.
   */
  definitionInflectionTable: WithArgs<{
    id: DefinitionInflectionTableId;
  }, DefinitionInflectionTable | null>;
  field: WithArgs<{
    id: FieldId;
  }, Field | null>;
  fieldValue: WithArgs<{
    id: FieldValueId;
  }, FieldValue | null>;
  /**
   * Finds an inflection table by ID.
   */
  inflectionTable: WithArgs<{
    id: InflectionTableId;
  }, InflectionTable | null>;
  /**
   * Finds an inflection table layout by ID.
   */
  inflectionTableLayout: WithArgs<{
    id: InflectionTableLayoutId;
  }, InflectionTableLayout | null>;
  /**
   * Finds an inflected form by ID.
   */
  inflectedForm: WithArgs<{
    id: InflectedFormId;
  }, InflectedForm | null>;
  /**
   * Lists all languages in the dictionary.
   */
  languages: Language[];
  /**
   * Finds a language by ID.
   */
  language: WithArgs<{
    id: LanguageId;
  }, Language | null>;
  /**
   * Finds a language by name.
   */
  languageByName: WithArgs<{
    name: string;
  }, Language | null>;
  /**
   * Finds a lemma by ID. For richer lemma search, see the `Language` type.
   */
  lemma: WithArgs<{
    id: LemmaId;
  }, Lemma | null>;
  /**
   * Finds a part of speech by ID.
   */
  partOfSpeech: WithArgs<{
    id: PartOfSpeechId;
  }, PartOfSpeech | null>;
  /**
   * Lists recently changed dictionary items. The results can be sorted by creation
   * date or by last update/edit date.
   * 
   * Recent items do not include every possible type of dictionary resource. If the
   * user changes an inflection table, there will not be recent change entries for
   * each individual inflected form, but for the table as a whole. Effectively, the
   * resources that have recent changes correspond to those for which there exist
   * corresponding `add*` and `edit*` mutations.
   * 
   * The `order` parameter determines the sort order. If omitted or null, defaults
   * to MOST_RECENTLY_UPDATED.
   * 
   * Since a dictionary may contain many items, this field is always paginated. If
   * provided, `page.perPage` cannot exceed 100.
   */
  recentChanges: WithArgs<{
    page?: PageParams | null;
    order?: RecentItemOrder | null;
  }, RecentItemConnection | null>;
  /**
   * Searches the dictionary.
   * 
   * The `params` parameter of this field contains a number of fields. The most
   * important is `query`, which contains the free text search query. At minimum,
   * a query to this field must include that:
   * 
   * ```graphql
   * query {
   *   search(params: {
   *     # Search for anything matching "foo"
   *     query: "foo"
   *   }) {
   *     ...
   *   }
   * }
   * ```
   * 
   * This field can search through most of the dictionary: lemmas, languages,
   * definitions, and more. The `scope` field specifies the kinds of resources that
   * should be searched:
   * 
   * ```graphql
   * query($query: String!) {
   *   search(params: {
   *     query: $query
   *     # Search only in languages and lemmas
   *     scopes: [SEARCH_LANGUAGES, SEARCH_LEMMAS]
   *   }) {
   *     ...
   *   }
   * }
   * ```
   * 
   * The search parameters can also include filters for other properties, such as
   * associated tags, part of speech or language. Use of these fields implicitly
   * constrains the type to resources with those fields. For example, only lemmas
   * and definitions have tags, so this example will only return results for those
   * resources (despite broader `scopes`):
   * 
   * ```graphql
   * query($query: String!, $tag, TagId!) {
   *   search(params: {
   *     query: $query
   *     scopes: [SEARCH_LANGUAGES, SEARCH_LEMMAS, SEARCH_DEFINITIONS, SEARCH_TAGS]
   *     # Only definitions and lemmas have tags; languages and tags will not be
   *     # present in the result.
   *     withTags: [$tag]
   *   }) {
   *     ...
   *   }
   * }
   * ```
   * 
   * Lastly, searches can match many items, so the results of a search are always
   * paginated. If provided, `page.perPage` cannot exceed 200.
   */
  search: WithArgs<{
    params: GlobalSearchParams;
    page?: PageParams | null;
  }, GlobalSearchResultConnection | null>;
  /**
   * The tags that exist in the dictionary. Since a dictionary may contain many
   * tags, this field is always paginated. If provided, `page.perPage` cannot
   * exceed 200.
   */
  tags: WithArgs<{
    page?: PageParams | null;
  }, TagConnection>;
  /**
   * Finds a tag by ID or name. You must specify either `id` or `name`. If you
   * specify both, only `id` will be used.
   */
  tag: WithArgs<{
    id?: TagId | null;
    name?: string | null;
  }, Tag | null>;
};

/**
 * A recently changed item.
 */
export type RecentItem =
  | Definition
  | InflectionTable
  | Language
  | PartOfSpeech;

/**
 * Contains paginated results from the `Query.recentChanges` field.
 */
export type RecentItemConnection = {
  /**
   * Pagination metadata for this batch.
   */
  page: PageInfo;
  /**
   * The items in this batch.
   */
  nodes: RecentItem[];
};

/**
 * Determines the order in which recent changes are sorted.
 */
export type RecentItemOrder =
  /**
   * Orders recent items by creation date, with the newest first.
   */
  | 'MOST_RECENTLY_CREATED'
  /**
   * Orders recent items by update/edit date, with the most recently edited first.
   */
  | 'MOST_RECENTLY_UPDATED'
;

/**
 * Contains search parameters for the `Language.search` field. See that field for
 * more documentation and examples.
 */
export type SearchInLanguageParams = {
  /**
   * The free text search query.
   */
  query: string;
  /**
   * The scopes to search within. This specifies the kinds of resources that will
   * be included in the search. Others filters may additionally limit the search
   * scope. For example, a part of speech filter will further constrain the search
   * to resources that have to a part of speech.
   * 
   * The values `SEARCH_LANGUAGES` and `SEARCH_TAGS` are not valid for language
   * searches. Passing either into this list is an error.
   * 
   * If omitted or null, all scopes are searched. If empty, no scopes are searched;
   * the result will be empty.
   */
  scopes?: SearchScope[] | null;
  /**
   * The IDs of parts of speech to search in. This limits the search to resources
   * that have a part of speech (lemmas and definitions). Notably, this *excludes*
   * parts of speech themselves.
   * 
   * A definition matches if it belongs to *any* of the specified parts of speech.
   * A lemma matches if *any* of its definitions match.
   * 
   * If omitted or null, no part of speech filter is applied. If empty, no parts
   * of speech are searched; the result will be empty.
   */
  inPartsOfSpeech?: PartOfSpeechId[] | null;
  /**
   * The IDs of tags to search in. This limits the search to resources that have
   * tags (lemmas and definitions). Notably, this *excludes* tags themselves.
   * 
   * The value of `tagMatching` determines how these values are used:
   * 
   * * If `tagMatching` is `MATCH_ANY`, then: a definition matches if it has *any*
   *   of the specified tags, and a lemma matches if *any* of its definitions
   *   match. In this mode, an empty list means no tags are searched; the result
   *   will be empty.
   * * If `tagMatching` is `MATCH_ALL`, then: a definition matches if it has *all*
   *   of the specified tags, and a lemma matches if its definitions together have
   *   *all* of the speciifed tags. In this mode, an empty list means all lemmas
   *   and definitions match (`[]` is a subset of every list).
   * 
   * If omitted or null, no tag filter is applied.
   */
  withTags?: TagId[] | null;
  /**
   * Determines how `withTags` matches. See the documentation of `withTags` for
   * more details. If omitted or null, the default value is `MATCH_ANY`.
   * 
   * This field has no effect if `withTags` is omitted or null.
   */
  tagMatching?: MatchingMode | null;
};

/**
 * The result of a search within a language (the `Language.search` field).
 */
export type SearchInLanguageResult =
  | LemmaSearchResult
  | DefinitionSearchResult
  | PartOfSpeechSearchResult;

/**
 * Contains paginated results from the `Language.search` field.
 */
export type SearchInLanguageResultConnection = {
  /**
   * Pagination metadata for this batch.
   */
  page: PageInfo;
  /**
   * The search results in this batch.
   */
  nodes: SearchInLanguageResult[];
};

/**
 * The scope of a search; that is, the type of resource that a search applies to.
 * Some scopes are invalid in some contexts, and some scopes can be implicitly
 * excluded by other search options. For details, see the documentation of each
 * input type that uses this enum.
 */
export type SearchScope =
  /**
   * Specifies that languages should be searched.
   */
  | 'SEARCH_LANGUAGES'
  /**
   * Specifies that lemmas should be searched.
   */
  | 'SEARCH_LEMMAS'
  /**
   * Specifies that definitions should be searched.
   */
  | 'SEARCH_DEFINITIONS'
  /**
   * Specifies that parts of speech should be searched.
   */
  | 'SEARCH_PARTS_OF_SPEECH'
  /**
   * Specifies that tags should be searched.
   */
  | 'SEARCH_TAGS'
;

/**
 * Input type for a definition inflection stem.
 */
export type StemInput = {
  /**
   * The name of the stem.
   */
  name: string;
  /**
   * The value of the stem.
   */
  value: string;
};

/**
 * A single paragraph of formatted text, which is used as a caption for inflection
 * tables attached to a definition.
 */
export type TableCaption = {
  /**
   * A list of formatted text parts that make up the caption's content. Note that
   * unlike a definition's description, a table caption cannot contain links.
   */
  inlines: FormattedText[];
};

/**
 * Input type for a table caption, which is a single paragraph of formatted text.
 */
export type TableCaptionInput = {
  /**
   * A list of formatted text parts that make up the caption's content. Note that
   * unlike a definition's description, a table caption cannot contain links.
   */
  inlines: FormattedTextInput[];
};

/**
 * Represents a generic tag. Tags with the same name have the same ID, and all
 * tags are shared between languages. Tags can be attached to definitions, and
 * are mainly used for thematic grouping ("colour", "emotion", "food", etc.).
 */
export type Tag = {
  /**
   * The ID of the tag.
   */
  id: TagId;
  /**
   * The name of the tag.
   */
  name: string;
};

/**
 * Contains paginated results from the `Query.tags` field.
 */
export type TagConnection = {
  /**
   * Pagination metadata for this batch.
   */
  page: PageInfo;
  /**
   * The tags in this batch.
   */
  nodes: Tag[];
};

/**
 * Represents a tag ID.
 */
export type TagId = IdOf<'Tag'>;

/**
 * A search result that matches a tag.
 */
export type TagSearchResult = {
  /**
   * A snippet over the matching part of the tag name.
   */
  nameSnippet: MatchingSnippet;
  /**
   * The tag that matched the search.
   */
  tag: Tag;
};

/**
 * Represents a user session. User sessions can be obtained by using the `logIn` or
 * `resumeSession` mutation. The `username` field is meant for use in UIs, such as
 * to show who the user is logged in as. The `sessionId` is the unique identifier
 * for the session.
 */
export type UserSession = {
  /**
   * The ID of the session. Use this value to resume the session later.
   */
  sessionId: string;
  /**
   * The name of the user this session applies to.
   */
  username: string;
  /**
   * The date and time that the session expires. After this point, the user must
   * log in again to make changes to the dictionary.
   */
  expiresAt: UtcInstant;
};

/**
 * Represents an instant in time. The value is sent as the number of milliseconds
 * since midnight 1 January 1970 UTC (that is, a value compatible with the JS
 * `Date` type).
 */
export type UtcInstant = number;

