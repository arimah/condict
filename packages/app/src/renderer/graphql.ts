/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

const IdKind = Symbol();

// This is a hack to get TypeScript to treat different ID types as distinct.
// The actual value will be a number (hence the `number` part), but by
// pretending there's an extra property that is unique to each type, we can
// get TypeScript to reject invalid ID uses, such as attempting to assign
// a DefinitionId to a LemmaId.

/** Represents an ID of the specified kind. */
export type IdOf<T extends string> = number & {
  [IdKind]: T;
};

const OperationSymbol = Symbol();
const ArgsSymbol = Symbol();
const ResultSymbol = Symbol();

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
 * Represents a part of speech ID.
 */
export type PartOfSpeechId = IdOf<'PartOfSpeech'>;

/**
 * Represents an inflection table ID.
 */
export type InflectionTableId = IdOf<'InflectionTable'>;

/**
 * Represents an inflection table layout ID.
 */
export type InflectionTableLayoutId = IdOf<'InflectionTableLayout'>;

/**
 * Represents an inflected form ID.
 */
export type InflectedFormId = IdOf<'InflectedForm'>;

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
 * Represents a tag ID.
 */
export type TagId = IdOf<'Tag'>;

/**
 * Represents an instant in time. The value is sent as the number of milliseconds
 * since midnight 1 January 1970 UTC (that is, a value compatible with the JS
 * `Date` type).
 */
export type UtcInstant = number;

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
};

/**
 * Input type for editing an existing part of speech.
 */
export type EditPartOfSpeechInput = {
  /**
   * If set, renames the part of speech.
   */
  name?: string | null | undefined;
};

/**
 * Input type for a new inflection table.
 */
export type NewInflectionTableInput = {
  /**
   * The part of speech that the inflection table will be added to.
   */
  partOfSpeechId: PartOfSpeechId;
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
 * an inflection table to another part of speech.
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
 * Represents a definition inflection table ID.
 */
export type DefinitionInflectionTableId = IdOf<'DefinitionInflectionTable'>;

