export interface TableSchema {
  /** The name of the table. */
  readonly name: string;
  /** The columns of the table. This array must not be empty. */
  readonly columns: ColumnSchema[];
  /**
   * The column or columns that make up the primary key of the table. Every
   * table must have a primary key, but it does not have to be an auto-incremented
   * ID column.
   */
  readonly primaryKey: IndexedColumn;
  /**
   * Columns that will receive the UNIQUE constraint. Note that each value in
   * the array can be a single column name or a list of multiple columns.
   */
  readonly unique?: IndexedColumn[];
  /**
   * Columns that will be indexed (non-UNIQUE). Note that each value in the
   * array can be a single column name or a list of multiple columns.
   */
  readonly index?: IndexedColumn[];
  /** If true, the rows in this table are not exported. */
  readonly skipExport?: boolean;
}

/**
 * One or more columns to be indexed. This can be either a single column name
 * (`string`), or a non-empty list of column names (`string[]`), usually two
 * or more.
 */
export type IndexedColumn = string | string[];

export type ColumnSchema =
  | IdColumnSchema
  | BooleanColumnSchema
  | IntegerColumnSchema
  | TextColumnSchema
  | EnumColumnSchema
  | JsonColumnSchema
  | FKColumnSchema;

export interface BaseColumnSchema {
  /** The name of the column. */
  readonly name: string;
  /** If true, null values are permitted in the column. */
  readonly allowNull?: boolean;
}

/**
 * A column that is defined by the table. Such a column must have a type.
 */
export interface OwnColumnSchema extends BaseColumnSchema {
  /** The type of the column. */
  readonly type: ColumnType;
}

export interface IdColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  readonly type: ColumnType.ID;
  /*
   * If true, the column value increments automatically. This property is only
   * relevant on columns of type 'id'.
   */
  readonly autoIncrement?: boolean;
}

export interface BooleanColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  readonly type: ColumnType.BOOLEAN;
  /**
   * The default value of the column, if applicable. If omitted, the column has
   * no default value.
   */
  readonly default?: boolean | null;
}

export interface IntegerColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  readonly type: ColumnType.INT;
  /**
   * The default value of the column, if applicable. If omitted, the column has
   * no default value.
   */
  readonly default?: number | null;
}

export interface TextColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  readonly type: ColumnType.TEXT;
  /**
   * The collation of the column. See more under {@link Collation}.
   */
  readonly collate?: Collation;
  /**
   * The default value of the column, if applicable. If omitted, the column has
   * no default value.
   */
  readonly default?: string | null;
}

export interface EnumColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  readonly type: ColumnType.ENUM;
  /** The valid values of the enumeration. Each value must be unique. */
  readonly values: string[];
  /**
   * The default value of the column, if applicable. If omitted, the column has
   * no default value.
   */
  readonly default?: string | null;
}

/** A column containing JSON data. */
export interface JsonColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  readonly type: ColumnType.JSON;
}

/** A column that references another row's `id` column. */
export interface FKColumnSchema extends BaseColumnSchema {
  /**
   * The foreign key referenced by the column. If omitted, the column is not a
   * foreign key.
   */
  readonly references: ForeignKeyRef;
}

export const isFKColumn = (def: ColumnSchema): def is FKColumnSchema => {
  return (def as FKColumnSchema).references != null;
};

/**
 * The type of a column. Many of these column types resolve to the same declared
 * SQLite type, and are distinguished mostly for the sake of the developer.
 */
export const enum ColumnType {
  /** An column type suitable for use as an ID. */
  ID,
  /**
   * A boolean column. Only 0 and 1 should be considered valid values for boolean
   * columns.
   */
  BOOLEAN,
  /** An integer column. */
  INT,
  /** A text column. */
  TEXT,
  /**
   * A type suitable for storing JSON-serialized data. The JSON data is passed
   * to the database as a string.
   */
  JSON,
  /**
   * An enumeration type. The `values` property contains the valid values for
   * this type. The exact implementation of enum types varies between drivers.
   */
  ENUM,
}

/** The collation of a text column. */
export const enum Collation {
  /**
   * A case-insensitive, Unicode-aware collation. The collation uses language-
   * agnostic case folding rules (i = I) and does not ignore diacritics (a ≠ á)
   * or punctuation. The sort order will inevitably be wrong for many languages,
   * but the default Unicode order is seen as the least bad alternative. This is
   * usually the most suitable collation for user-entered text that needs to be
   * unique, e.g. names of languages.
   */
  UNICODE,
  /** A case-sensitive binary collation. It compares text by exact binary contents. */
  BINARY,
}

/** A reference to a foreign key. */
export interface ForeignKeyRef {
  /** The name of the referenced table. */
  readonly table: string;
  /**
   * The name of the referenced column. At present, it is only possible to
   * reference a primary key named `id`.
   */
  readonly column: 'id';
  /**
   * Determines how to handle deletions of the referenced row. See the type
   * documentation for details.
   */
  readonly onDelete: ReferenceAction;
}

/**
 * Determines how to handle changes (updates, deletes) to the row referenced by
 * a foreign key.
 */
export const enum ReferenceAction {
  /** The referenced row cannot be changed while this column references it. */
  RESTRICT,
  /** The referencing row is changed alongside the referenced row. */
  CASCADE,
}

/**
 * A reference to a foreign key, inside a JSON object. Unlike a regular foreign
 * key reference, a content reference is not checked by the database engine, so
 * there is no way to update the content in response to changes in the row that
 * is referenced.
 */
export interface ForeignKeyContentRef {
  /** The name of the referenced table. */
  readonly table: string;
  /**
   * The name of the referenced column. At present, it is only possible to
   * reference a primary key named `id`.
   */
  readonly column: 'id';
}
