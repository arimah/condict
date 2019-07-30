import Adaptor from '../adaptor';

export interface TableSchema {
  /** The name of the table. */
  name: string;
  /**
   * A comment that describes the purpose of the table and any design rationales
   * that are worth highlighting. The comment is intended to help anyone who
   * looks through the database in a client, that is, without having the code
   * handy. If the database engine does not support comments, this property is
   * ignored by the adaptor.
   */
  comment: string;
  /** The columns of the table. This array must not be empty. */
  columns: ColumnSchema[];
  /**
   * The column or columns that make up the primary key of the table. Every
   * table must have a primary key, but it does not have to be an auto-incremented
   * ID column.
   */
  primaryKey: IndexedColumn;
  /**
   * Columns that will receive the UNIQUE constraint. Note that each value in
   * the array can be a single column name or a list of multiple columns.
   */
  unique?: IndexedColumn[];
  /**
   * Columns that will be indexed (non-UNIQUE). Note that each value in the
   * array can be a single column name or a list of multiple columns.
   */
  index?: IndexedColumn[];
  /**
   * A function that performs additional validation on a row before it is
   * imported, such as checking that a unique value constraint is not violated.
   * @param db The database connection.
   * @param row The row to be imported.
   * @return A promise. If rejected, the import is aborted. If it resolves, the
   *         import continues.
   */
  preImport?: (db: Adaptor, row: any) => Promise<void>;
  /** If true, the rows in this table are not exported. */
  skipExport?: boolean;
}


/**
 * One or more columns to be indexed. This can be either a single column name
 * (`string`), or a non-empty list of column names (`string[]`), usually two
 * or more.
 */
export type IndexedColumn = string | string[];

/**
 * A function that transforms a column value during import or export.
 * @param value The column value to be imported or exported.
 * @param newIds New values of ID columns for previously imported or exported
 *        tables. See the {@link NewIdMap} type for more details.
 * @return The new column value. When importing, the type must match the type
 *         of the column. When exporting, the type must be JSON serializable
 *         (arrays and objects are fine).
 */
export type ImportExportFunction = (value: any, newIds: NewIdMap) => any;

export type ColumnSchema
  = IdColumnSchema
  | BooleanColumnSchema
  | IntegerColumnSchema
  | VarcharColumnSchema
  | EnumColumnSchema
  | JsonColumnSchema
  | FKColumnSchema;

export interface BaseColumnSchema {
  /** The name of the column. */
  name: string;
  /**
   * A comment that describes the purpose of the column. See the `comment` column
   * in {@link TableSchema}.
   */
  comment: string;
  /** If true, null values are permitted in the column. */
  allowNull?: boolean;
  /** A function that transforms the column value before it is exported. */
  export?: ImportExportFunction;
  /** A function that transforms the column value before it is imported. */
  import?: ImportExportFunction;
}

/**
 * A column that is defined by the table. Such a column must have a type.
 */
export interface OwnColumnSchema extends BaseColumnSchema {
  /** The type of the column. */
  type: ColumnType;
}

export interface IdColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  type: ColumnType.ID;
  /*
   * If true, the column value increments automatically. This property is only
   * relevant on columns of type 'id'.
   */
  autoIncrement?: boolean;
}

export interface BooleanColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  type: ColumnType.BOOLEAN;
  /**
   * The default value of the column, if applicable. If omitted, the column has
   * no default value, the exact meaning of which varies between database engines.
   * Most columns have no default value.
   */
  default?: boolean | null;
}

export interface IntegerColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  type: ColumnType.UNSIGNED_INT;
  /**
   * The size of the column in bits. The database engine guarantees at least
   * this capacity.
   */
  size: number;
  /**
   * The default value of the column, if applicable. If omitted, the column has
   * no default value, the exact meaning of which varies between database engines.
   * Most columns have no default value.
   */
  default?: number | null;
}

export interface VarcharColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  type: ColumnType.VARCHAR;
  /**
   * The size of the column, which is the maximum number of Unicode code points
   * that can be stored in the column.
   */
  size: number;
  /**
   * The collation of the column. See more under {@link Collation}.
   */
  collate?: Collation;
  /**
   * The default value of the column, if applicable. If omitted, the column has
   * no default value, the exact meaning of which varies between database engines.
   * Most columns have no default value.
   */
  default?: string | null;
}

export interface EnumColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  type: ColumnType.ENUM;
  /** The valid values of the enumeration. Each value must be unique. */
  values: string[];
  /**
   * The default value of the column, if applicable. If omitted, the column has
   * no default value, the exact meaning of which varies between database engines.
   * Most columns have no default value.
   */
  default?: string | null;
}

/** A column containing JSON data. */
export interface JsonColumnSchema extends OwnColumnSchema {
  /** The type of the column. */
  type: ColumnType.JSON;
  /**
   * Foreign keys referenced by some part of the content of the column. This is
   * used for JSON columns that may contain IDs of foreign columns. For example,
   * an inflection table's layout (a JSON object) references inflected forms by
   * ID. This property must list *all* tables that could be referenced by the
   * column.
   */
  contentReferences?: ForeignKeyContentRef[];
}

/** A column that references another row's `id` column. */
export interface FKColumnSchema extends BaseColumnSchema {
  /**
   * The foreign key referenced by the column. If omitted, the column is not a
   * foreign key.
   */
  references: ForeignKeyRef;
}

export const isFKColumn = (def: ColumnSchema): def is FKColumnSchema => {
  return (def as FKColumnSchema).references != null;
};

/** The type of a column. */
export const enum ColumnType {
  /**
   * An integer type suitable for use as an ID. The database adaptor determines
   * the exact type, but it is guaranteed to have at least unsigned 32-bit
   * integer range.
   */
  ID = 'id',
  /**
   * A boolean type. Only 0 and 1 should be considered valid values for boolean
   * columns.
   */
  BOOLEAN = 'boolean',
  /**
   * An unsigned integer type. The `size` property on the column definition
   * specifies the minimum required size, in bits, of the column.
   */
  UNSIGNED_INT = 'unsigned int',
  /**
   * A variable-size character type. The `size` property on the column
   * definition specifies the maximum length, in number of Unicode code points,
   * of the column.
   */
  VARCHAR = 'varchar',
  /**
   * A type suitable for storing JSON-serialized data. The JSON data is passed
   * to the adaptor as a string. The `size` property is *not* applicable to
   * columns of this type.
   */
  JSON = 'json',
  /**
   * An enumeration type. The `values` property contains the valid values for
   * this type. The exact implementation of enum types varies between drivers.
   */
  ENUM = 'enum',
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
  UNICODE = 'unicode',
  /** A case-sensitive binary collation. It compares text by exact binary contents. */
  BINARY = 'binary',
}

/** A reference to a foreign key. */
export interface ForeignKeyRef {
  /** The name of the referenced table. */
  table: string;
  /**
   * The name of the referenced column. At present, it is only possible to
   * reference a primary key named `id`.
   */
  column: 'id';
  /**
   * Determines how to handle deletions of the referenced row. See the type
   * documentation for details.
   */
  onDelete: ReferenceAction;
}

/**
 * Determines how to handle changes (updates, deletes) to the row referenced by
 * a foreign key.
 */
export const enum ReferenceAction {
  /** The referenced row cannot be changed while this column references it. */
  RESTRICT = 'restrict',
  /** The referencing row is changed alongside the referenced row. */
  CASCADE = 'cascade',
}

/**
 * A reference to a foreign key, inside a JSON object. Unlike a regular foreign
 * key reference, a content reference is not checked by the database engine, so
 * there is no way to update the content in response to changes in the row that
 * is referenced.
 */
export interface ForeignKeyContentRef {
  /** The name of the referenced table. */
  table: string;
  /**
   * The name of the referenced column. At present, it is only possible to
   * reference a primary key named `id`.
   */
  column: 'id';
}

/**
 * When the database is exported, auto-incremented IDs are not preserved. Rather
 * than messing up references to ID columns, the exporter and importer rewrite IDs
 * to their new values. This type contains a mapping from old ID to new ID, for
 * each table. The key is the table name, the value is the ID mapping.
 */
export interface NewIdMap {
  [k: string]: Map<number, number>;
}
