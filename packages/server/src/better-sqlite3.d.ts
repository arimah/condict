// @types/better-sqlite3 is woefully out of date and no effort appears to have
// been made to update it. Hence, we roll our own types here.

declare module 'better-sqlite3' {
  namespace Database {
    interface DatabaseOptions {
      readonly?: boolean;
      fileMustExist?: boolean;
      timeout?: number;
      verbose?: DatabaseVerboseFunction;
    }

    type DatabaseVerboseFunction = (msg?: any, ...additionalArgs: any[]) => void;

    interface DatabaseConstructor {
      new(path: string, options?: DatabaseOptions): Database.Database;
    }

    interface Database {
      readonly open: boolean;
      readonly inTransaction: boolean;
      readonly name: string;
      readonly memory: boolean;
      readonly readonly: boolean;

      prepare<P extends BindParameters = BindParameters>(sql: string): Statement<P>;

      transaction<F extends TransactionFunction>(
        f: F
      ): Transaction<F>;

      pragma(pragma: string, options?: PragmaOptions): unknown;

      backup(destination: string, options?: BackupOptions): Promise<BackupResult>;

      serialize(options?: SerializeOptions): Buffer;

      function(name: string, fn: UserFunction): this;
      function(name: string, options: FunctionOptions, fn: UserFunction): this;

      aggregate<Acc>(name: string, options: AggregateOptions<Acc>): this;

      loadExtension(path: string, entryPoint?: string): this;

      defaultSafeIntegers(state?: boolean): this;

      exec(sql: string): this;

      close(): this;
    }

    interface Transaction<F extends TransactionFunction> {
      (...args: Parameters<F>): ReturnType<F>;

      deferred(...args: Parameters<F>): ReturnType<F>;

      immediate(...args: Parameters<F>): ReturnType<F>;

      exclusive(...args: Parameters<F>): ReturnType<F>;
    }

    type TransactionFunction = (...args: any[]) => any;

    interface PragmaOptions {
      simple?: boolean;
    }

    interface BackupOptions {
      attached?: string;
      progress?: BackupProgressFunction;
    }

    type BackupProgressFunction = (progress: BackupProgress) => number | void;

    interface BackupProgress {
      totalPages: number;
      remainingPages: number;
    }

    interface BackupResult {
      totalPages: number;
      remainingPages: 0;
    }

    interface SerializeOptions {
      attached?: string;
    }

    type UserFunction = (...args: any[]) => any;

    interface FunctionOptions {
      varargs?: boolean;
      directOnly?: boolean;
      deterministic?: boolean;
      safeIntegers?: boolean;
    }

    interface AggregateOptions<Acc> extends FunctionOptions {
      start: AggregateStartValue<Acc>;
      step: AggregateStepFunction<Acc>;
      inverse?: AggregateStepFunction<Acc>;
      result?: AggregateResultFunction<Acc>;
    }

    type AggregateStartValue<Acc> = Acc | (() => Acc);

    type AggregateStepFunction<Acc> = (accumulator: Acc, value: any) => Acc | void;

    type AggregateResultFunction<Acc> = (final: Acc) => any;

    interface Statement<P extends BindParameters = BindParameters> {
      readonly database: Database;
      readonly source: string;
      readonly reader: boolean;
      readonly readonly: boolean;

      pluck(state?: boolean): this;

      expand(state?: boolean): this;

      raw(state?: boolean): this;

      safeIntegers(state?: boolean): this;

      columns(): ColumnInfo[];

      run(...bindParameters: P): RunResult;

      get(...bindParameters: P): any;

      all(...bindParameters: P): any[];

      iterate(...bindParameters: P): IterableIterator<any>;

      bind(...bindParameters: P): this;
    }

    interface ColumnInfo {
      name: string;
      column: string | null;
      table: string | null;
      database: string | null;
      type: string | null;
    }

    interface RunResult {
      changes: number;
      lastInsertRowid: number;
    }

    type BindParameters = (BindValue | BindValue[] | Record<string, BindValue>)[];

    type BindValue =
      | undefined
      | null
      | number
      | bigint
      | string
      | Buffer; // For blobs
  }

  const Database: Database.DatabaseConstructor;
  export = Database;
}
