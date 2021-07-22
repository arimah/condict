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
 * Represents a lemma ID.
 */
export type LemmaId = IdOf<'Lemma'>;

/**
 * Represents a language ID.
 */
export type LanguageId = IdOf<'Language'>;

/**
 * Represents a definition ID.
 */
export type DefinitionId = IdOf<'Definition'>;

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
 * Represents a part of speech ID.
 */
export type PartOfSpeechId = IdOf<'PartOfSpeech'>;

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

