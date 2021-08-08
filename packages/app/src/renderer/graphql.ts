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
 * Represents an inflection table ID.
 */
export type InflectionTableId = IdOf<'InflectionTable'>;

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

