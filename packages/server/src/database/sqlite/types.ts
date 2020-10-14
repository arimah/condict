import FieldSet from '../../model/field-set';

/** Contains database configuration. */
export interface Options {
  /**
   * The path to the database file. The file is created if it does not exist.
   */
  readonly file: string;
}

export const validateOptions = (options: any): Options => {
  if (options == null || typeof options !== 'object') {
    throw new Error('Database config must be an object.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
  const file = options.file;
  if (typeof file !== 'string') {
    throw new Error('Database file name must be a string.');
  }
  if (file === '') {
    throw new Error('Database file name cannot be empty.');
  }
  return {file};
};

/** Contains the result of a non-query command execution. */
export interface ExecResult<I extends number> {
  /**
   * The ID of the last inserted row. If the command passed to `exec` did not
   * insert any rows, the value of this field is unspecified.
   */
  readonly insertId: I;
  /** The total number of rows affected by the command. */
  readonly affectedRows: number;
}

/** A value that can be awaited. */
export type Awaitable<T> = T | Promise<T>;

/**
 * Represents raw SQL text. Values of this class can be embedded directly in
 * SQL queries and commands without escaping, unlike regular string values.
 * The `raw` method on the database can be used to construct RawSql values.
 */
export class RawSql {
  public sql: string;
  public params: Param[];

  public constructor(sql: string, params: Param[]) {
    this.sql = sql;
    this.params = params;
  }
}

/** A scalar value that can be embedded in an SQL string. */
export type Scalar =
  | RawSql
  | string
  | number
  | boolean
  | null
  | undefined;

/** A value that can be embedded in an SQL string. */
export type Value =
  | FieldSet<{readonly [k: string]: Scalar}>
  | readonly Scalar[]
  | Scalar;

/** An SQL parameter. */
export type Param = string | number | null;
