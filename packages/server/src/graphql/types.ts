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

const ArgsType = Symbol();

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
 * Represents a date and time. The value is sent as the number of milliseconds
 * since midnight 1 January 1970 UTC (that is, a value compatible with the JS
 * `Date` type).
 */
export type Date = number;

/**
 * As its name suggests, a definition defines a lemma. A definition has a part of
 * speech, a description, and, optionally, some inflection tables.
 * 
 * A definition's description contains free-form formatted text. Paragraphs, list
 * items, headings and other things.
 * 
 * A definition's inflection tables must belong to the definition's part of speech.
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
   * A raw JSON string equivalent of `description`. Generally, you should avoid
   * using this field; prefer `description` whenever possible.
   */
  descriptionRaw: string;
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
};

/**
 * Contains paginated results from one of the following fields:
 * 
 * * `InflectionTable.usedByDefinitions`
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
   * 
   * If this field is set to a value other than the definition's current part of
   * speech, and `inflectionTables` is _not_ set, then the definition's inflection
   * tables will all be deleted. In other words, changing the part of speech will
   * delete inflection tables unless you specify new ones.
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
};

/**
 * Input type for editing an existing inflection table. It is not possible to move
 * an inflection table to another part of speech.
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
};

/**
 * Input type for editing an existing part of speech.
 */
export type EditPartOfSpeechInput = {
  /**
   * If set, renames the part of speech.
   */
  name?: string | null;
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
 * A single inflected form. Each form belongs to exactly one table.
 * 
 * An inflected form has an _inflection pattern_, which describes how to construct
 * the form when applied to a word. Inflection patterns contain placeholders inside
 * curly brackets, such as `{Plural root}`, which are replaced by the definition's
 * stems. See `Definition.stems` and `DefinitionStem` for more. The placeholder
 * `{~}` always refers to the definition's lemma form.
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
 * An inflection table defines how to inflect words that belong to the table's part
 * of speech. The table is a true 2-dimensional table, not merely a list of forms.
 * As such, it can contain any number of rows and columns, and some cells may be
 * headers. Cells can span multiple rows and columns.
 * 
 * To access the contents of an inflection table, query the `layout` field. Through
 * it, you can read the table's rows and cells to construct the table, fetch the
 * inflected forms (see `InflectedForm`) that are contained in the table, as well
 * as query the definitions that use the table layout.
 * 
 * In addition to the current table layout, inflection tables record some historical
 * layouts. If the layout is altered while it is in use by one or more definitions,
 * the previous layout is kept, allowing existing definitions to keep using it. Old
 * layouts are available through the `oldLayouts` field.
 * 
 * Historical layouts are saved for two reasons:
 * 
 * 1. Inflected forms may be added to the dictionary (see `InflectedForm`), and
 *    recalculating new forms for every definition that uses a table is costly.
 * 2. It is exceedingly difficult for the user to predict the effect of altering
 *    an inflection table across the entire dictionary, especially if the table is
 *    used by many definitions.
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
   * Since there may be many old layouts, this field always paginated. If provided,
   * `page.perPage` cannot exceed 200.
   */
  oldLayouts: WithArgs<{
    page?: PageParams | null;
  }, InflectionTableLayoutConnection>;
  /**
   * The part of speech that this inflection table belongs to.
   */
  partOfSpeech: PartOfSpeech;
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
   * Since the table may be used by many definitions, this field always paginated.
   * If provided, `page.perPage` cannot exceed 200.
   */
  usedByDefinitions: WithArgs<{
    page?: PageParams | null;
  }, DefinitionConnection>;
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
   * Since the table may be used by many definitions, this field always paginated.
   * If provided, `page.perPage` cannot exceed 200.
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
 * * Lemmas (see `Lemma`), which are basically the words of the dictionary. Each
 *   lemma can contain any number of definitions (see `Definition`).
 * 
 * In addition, every language has a (unique) name.
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
   * The parts of speech that belong to this language.
   */
  partsOfSpeech: PartOfSpeech[];
  /**
   * The total number of lemmas in the dictionary.
   */
  lemmaCount: number;
  /**
   * The lemmas defined in the dictionary. Since a language usually contains many
   * lemmas, this field is always paginated. If provided, `page.perPage` cannot
   * exceed 200.
   */
  lemmas: WithArgs<{
    page?: PageParams | null;
    filter?: LemmaFilter | null;
  }, LemmaConnection>;
  /**
   * The tags used by this language. Since a language may use many tags, this field
   * is always paginated. If provided, `page.perPage` cannot exceed 200.
   */
  tags: WithArgs<{
    page?: PageParams | null;
  }, TagConnection>;
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
 * Determines how to filter lemmas.
 */
export type LemmaFilter =
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
 * Represents a lemma ID.
 */
export type LemmaId = IdOf<'Lemma'>;

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
  }, Definition>;
  /**
   * Edits an existing definition.
   * 
   * Requires authentication.
   */
  editDefinition: WithArgs<{
    id: DefinitionId;
    data: EditDefinitionInput;
  }, Definition>;
  /**
   * Deletes a definition.
   * 
   * Requires authentication.
   */
  deleteDefinition: WithArgs<{
    id: DefinitionId;
  }, boolean>;
  /**
   * Adds an inflection table.
   * 
   * Requires authentication.
   */
  addInflectionTable: WithArgs<{
    data: NewInflectionTableInput;
  }, InflectionTable>;
  /**
   * Edits an inflection table.
   * 
   * Requires authentication.
   */
  editInflectionTable: WithArgs<{
    id: InflectionTableId;
    data: EditInflectionTableInput;
  }, InflectionTable>;
  /**
   * Deletes an inflection table. It is not possible to delete a table that is used
   * by one or more definitions.
   * 
   * Requires authentication.
   */
  deleteInflectionTable: WithArgs<{
    id: InflectionTableId;
  }, boolean>;
  /**
   * Adds a language.
   * 
   * Requires authentication.
   */
  addLanguage: WithArgs<{
    data: NewLanguageInput;
  }, Language>;
  /**
   * Edits a language.
   * 
   * Requires authentication.
   */
  editLanguage: WithArgs<{
    id: LanguageId;
    data: EditLanguageInput;
  }, Language>;
  /**
   * Adds a part of speech.
   * 
   * Requires authentication.
   */
  addPartOfSpeech: WithArgs<{
    data: NewPartOfSpeechInput;
  }, PartOfSpeech>;
  /**
   * Edits a part of speech.
   * 
   * Requires authentication.
   */
  editPartOfSpeech: WithArgs<{
    id: PartOfSpeechId;
    data: EditPartOfSpeechInput;
  }, PartOfSpeech>;
  /**
   * Deletes a part of speech. It is not possible to delete a part of speech that
   * is in use by any definition.
   * 
   * Requires authentication.
   */
  deletePartOfSpeech: WithArgs<{
    id: PartOfSpeechId;
  }, boolean>;
  /**
   * Attempts to log in on the server using the specified username and password.
   */
  logIn: WithArgs<{
    username: string;
    password: string;
  }, LoginResult>;
  /**
   * Logs out of the current session. Returns true if the session was terminated,
   * false if there is no current session.
   */
  logOut: boolean;
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
 * Input type for a new language.
 */
export type NewLanguageInput = {
  /**
   * The display name of the language.
   */
  name: string;
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
 * A part of speech is associated with each word in the dictionary. In addition to
 * providing a way to group words, a part of speech can define any number of
 * inflection tables, which describe how to inflect words in that part of speech.
 * See `InflectionTable` for more.
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
   * The inflection tables defined in this part of speech.
   */
  inflectionTables: InflectionTable[];
  /**
   * The language that the part of speech belongs to.
   */
  language: Language;
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
   * Since the part of speech may be used by many definitions, this field always
   * paginated. If provided, `page.perPage` cannot exceed 200.
   */
  usedByDefinitions: WithArgs<{
    page?: PageParams | null;
  }, DefinitionConnection>;
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
  expiresAt: Date;
};

