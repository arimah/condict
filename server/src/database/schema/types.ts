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

export interface ColumnSchema {
  /** The name of the column. */
  name: string;
  /**
   * A comment that describes the purpose of the column. See the `comment` column
   * in {@link TableSchema}.
   */
  comment: string;
  /**
   * The type of the column. If the column references a foreign key (`references`
   * is set), then the type is taken from the referenced column, and this
   * property is optional. Otherwise the type is required.
   */
  type?: ColumnType;
  /** If true, null values are permitted in the column. */
  allowNull?: boolean;
  /**
   * The size of the column, whose meaning varies according to its type. For
   * integer columns, it is the size of the column in bits. For variable-size
   * character columns, it is the maximum size of the column in Unicode code
   * points. See more under {@link ColumnType}.
   */
  size?: number;
  /**
   * On columns of a character type, defines the collation of the column. See
   * more under {@link Collation}.
   */
  collate?: Collation;
  /**
   * On columns of an enum type, contains the valid values of the enumeration.
   * Each value must be unique.
   */
  values?: string[];
  /*
   * If true, the column value increments automatically. This property is only
   * relevant on columns of type 'id'.
   */
  autoIncrement?: boolean;
  /**
   * The default value of the column, if applicable. If omitted, the column has
   * no default value, the exact meaning of which varies between database engines.
   * Most columns have no default value.
   */
  default?: any;
  /**
   * The foreign key referenced by the column. If omitted, the column is not a
   * foreign key.
   */
  references?: ForeignKeyRef;
  /**
   * Foreign keys referenced by some part of the content of the column. This is
   * used for JSON columns that may contain IDs of foreign columns. For example,
   * an inflection table's layout (a JSON object) references inflected forms by
   * ID. This property must list *all* tables that could be referenced by the
   * column.
   */
  contentReferences?: ForeignKeyRef[];
  /** A function that transforms the column value before it is exported. */
  export?: ImportExportFunction;
  /** A function that transforms the column value before it is imported. */
  import?: ImportExportFunction;
}

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
  /** The name of the referenced column. */
  column: string;
  /**
   * Determines how to handle deletions of the referenced row. 'cascade' means
   * this row is deleted when the referenced row is. 'restrict' means the
   * referenced row cannot be deleted if it is referenced by this foreign key.
   * If omitted, the default is 'restrict'. This property is ignored on foreign
   * key references inside `contentReferences`.
   */
  onDelete?: 'restrict' | 'cascade';
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
