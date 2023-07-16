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

declare const OperationSymbol: unique symbol;
declare const ArgsSymbol: unique symbol;
declare const ResultSymbol: unique symbol;

// Similar to the IdOf type, this is a hack to attach extra metadata to an operation.
// The symbol fields don't actually exist (the value is just a string), but allow us
// to extract the operation kind, and argument and result types from the query.
export type Operation<O extends string, A, R> = string & {
  [OperationSymbol]: O;
  [ArgsSymbol]: A;
  [ResultSymbol]: R;
};

export type OperationArgs<Op> = Op extends Operation<any, infer A, any> ? A : unknown;
export type OperationResult<Op> = Op extends Operation<any, any, infer R> ? R : unknown;

export type Query<A, R> = Operation<'query', A, R>;

export type Mutation<A, R> = Operation<'mutation', A, R>;

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
 * Represents a language ID.
 */
export type LanguageId = IdOf<'Language'>;

/**
 * Represents a lemma ID.
 */
export type LemmaId = IdOf<'Lemma'>;

/**
 * Represents a definition ID.
 */
export type DefinitionId = IdOf<'Definition'>;

/**
 * Represents an inflection table ID.
 */
export type InflectionTableId = IdOf<'InflectionTable'>;

/**
 * Represents a part of speech ID.
 */
export type PartOfSpeechId = IdOf<'PartOfSpeech'>;

/**
 * Represents an inflection table layout ID.
 */
export type InflectionTableLayoutId = IdOf<'InflectionTableLayout'>;

/**
 * Represents an inflected form ID.
 */
export type InflectedFormId = IdOf<'InflectedForm'>;

/**
 * Represents a field ID.
 */
export type FieldId = IdOf<'Field'>;

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
 * Represents a definition inflection table ID.
 */
export type DefinitionInflectionTableId = IdOf<'DefinitionInflectionTable'>;

/**
 * Represents an instant in time. The value is sent as the number of milliseconds
 * since midnight 1 January 1970 UTC (that is, a value compatible with the JS
 * `Date` type).
 */
export type UtcInstant = number;

/**
 * Represents a tag ID.
 */
export type TagId = IdOf<'Tag'>;

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
  description?: BlockElementInput[] | null | undefined;
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
  level?: number | null | undefined;
  /**
   * A list of inlines, which contain the block's formatted text content as well
   * as links.
   */
  inlines: InlineElementInput[];
};

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
  text?: FormattedTextInput | null | undefined;
  /**
   * If set, the inline element is a link, and this field contains the link target
   * and its formatted text content.
   */
  link?: LinkInlineInput | null | undefined;
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
  bold?: boolean | null | undefined;
  /**
   * If true, the text is italicized.
   */
  italic?: boolean | null | undefined;
  /**
   * If true, the text is underlined.
   */
  underline?: boolean | null | undefined;
  /**
   * If true, the text is struck through.
   */
  strikethrough?: boolean | null | undefined;
  /**
   * If true, the text is formatted as subscript characters.
   * 
   * `subscript` and `superscript` are mutually exclusive.
   */
  subscript?: boolean | null | undefined;
  /**
   * If true, the text is formatted as superscript characters.
   * 
   * `subscript` and `superscript` are mutually exclusive.
   */
  superscript?: boolean | null | undefined;
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
 * Input type for editing an existing language.
 */
export type EditLanguageInput = {
  /**
   * If set, updates the display name of the language.
   */
  name?: string | null | undefined;
  /**
   * If set, updates the language's description.
   */
  description?: BlockElementInput[] | null | undefined;
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
  description?: BlockElementInput[] | null | undefined;
};

/**
 * Input type for editing an existing part of speech.
 */
export type EditPartOfSpeechInput = {
  /**
   * If set, renames the part of speech.
   */
  name?: string | null | undefined;
  /**
   * If set, updates the part of speech description.
   */
  description?: BlockElementInput[] | null | undefined;
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
 * Input type for an inflection table cell. This type combines header cells and
 * inflected forms, and is used for both new and existing tables.
 */
export type InflectionTableCellInput = {
  /**
   * The column span of the cell. The value must be greater than 0. If omitted,
   * defaults to 1.
   */
  columnSpan?: number | null | undefined;
  /**
   * The row span of the cell. The value must be greater than 0. If omitted,
   * defaults to 1.
   */
  rowSpan?: number | null | undefined;
  /**
   * The text displayed in the header cell. If this field is set, the cell is a
   * header.
   */
  headerText?: string | null | undefined;
  /**
   * The inflected form displayed in the cell. If this field is set, the cell is
   * a data cell. In a new table, the cell's `id` property is ignored.
   */
  inflectedForm?: InflectedFormInput | null | undefined;
};

/**
 * Input type for an inflected form. This type is used for both new and existing
 * forms.
 */
export type InflectedFormInput = {
  /**
   * The ID of the inflected form. In a new table, this property is ignored. When
   * editing an existing table, if set, it will update an existing form.
   */
  id?: InflectedFormId | null | undefined;
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
 * Input type for editing an existing inflection table. It is not possible to move
 * an inflection table to another language.
 */
export type EditInflectionTableInput = {
  /**
   * If set, renames the inflection table.
   */
  name?: string | null | undefined;
  /**
   * If set, updates the layout of the inflection table.
   * 
   * If the table is used by any definitions, changing the layout will cause a new
   * new layout version to be created. See the documentation of `InflectionTable`.
   */
  layout?: InflectionTableRowInput[] | null | undefined;
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
 * Input type for a new definition's inflection table.
 */
export type NewDefinitionInflectionTableInput = {
  /**
   * An optional formatted text that describes the table.
   */
  caption?: TableCaptionInput | null | undefined;
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
 * Input type for a table caption, which is a single paragraph of formatted text.
 */
export type TableCaptionInput = {
  /**
   * A list of formatted text parts that make up the caption's content. Note that
   * unlike a definition's description, a table caption cannot contain links.
   */
  inlines: FormattedTextInput[];
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
  booleanValue?: boolean | null | undefined;
  /**
   * The value of a list field. Some fields may only accept a single value. Passing
   * the empty list is equivalent to omitting the field altogether.
   */
  listValues?: FieldValueId[] | null | undefined;
  /**
   * The value of a plain-text field.
   */
  textValue?: string | null | undefined;
};

/**
 * Represents ID of a field value.
 */
export type FieldValueId = IdOf<'FieldValue'>;

/**
 * Input type for editing an existing definition. The ID is a separate argument.
 */
export type EditDefinitionInput = {
  /**
   * If set, updates the definition term.
   */
  term?: string | null | undefined;
  /**
   * If set, updates the part of speech.
   */
  partOfSpeechId?: PartOfSpeechId | null | undefined;
  /**
   * If set, updates the definition description.
   */
  description?: BlockElementInput[] | null | undefined;
  /**
   * If set, updates the definition's inflection stems.
   */
  stems?: StemInput[] | null | undefined;
  /**
   * If set, updates the definition's inflection tables. If the `id` property is
   * set on any table in this list, it will update that existing table. For each
   * table _without_ an `id`, a new definition inflection table is created.
   */
  inflectionTables?: EditDefinitionInflectionTableInput[] | null | undefined;
  /**
   * If set, updates the definition's tags.
   */
  tags?: string[] | null | undefined;
  /**
   * If set, updates the definition's custom field values. To clear the
   * definition's field values, pass an empty array, not `null`.
   */
  fields?: DefinitionFieldInput[] | null | undefined;
};

/**
 * Input type for editing a definition's inflection table.
 */
export type EditDefinitionInflectionTableInput = {
  /**
   * The ID of the definition inflection table. If set, it will update an existing
   * definition inflection table.
   */
  id?: DefinitionInflectionTableId | null | undefined;
  /**
   * An optional formatted text that describes the table.
   */
  caption?: TableCaptionInput | null | undefined;
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
  upgradeTableLayout?: boolean | null | undefined;
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
  listValues?: FieldValueInput[] | null | undefined;
  /**
   * The parts of speech that this field can be used in. To mark a field as usable
   * in any part of speech, even ones that are added in the future, pass the empty
   * list. It is not possible to create a field that cannot be used in any part of
   * speech.
   */
  partOfSpeechIds: PartOfSpeechId[];
};

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
  id?: FieldValueId | null | undefined;
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
 * Input type for editing an existing field. The ID is a separate argument.
 */
export type EditFieldInput = {
  /**
   * If set, updates the field's name.
   */
  name?: string | null | undefined;
  /**
   * If set, updates the abbreviated version of the field's name.
   */
  nameAbbr?: string | null | undefined;
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
  valueType?: FieldValueType | null | undefined;
  /**
   * If set, updates the field's values, for a list field. A list of field values
   * is *required* if the field is changing to a list type; it cannot be null. If
   * the field is not a list type, or is being changed to a non-list type, this
   * value *must* be null.
   * 
   * When editing the values of a list field, *all* of the field's values must be
   * present here. Omitted values will be deleted.
   */
  listValues?: FieldValueInput[] | null | undefined;
  /**
   * If set, updates the parts of speech that this field can be used in. To mark a
   * field as usable in any part of speech, even ones that are added in the future,
   * pass the empty list. It is not possible to create a field that cannot be used
   * in any part of speech.
   */
  partOfSpeechIds?: PartOfSpeechId[] | null | undefined;
};

