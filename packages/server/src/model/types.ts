import {DataAccessor, DataWriter} from '../database';
import {DictionaryEventEmitter} from '../event';
import DictionaryEventQueue from '../event-queue';
import {Context, PageInfo} from '../graphql';
import {Logger} from '../types';

interface BaseContext<Data> {
  /** The database accessor for the request. */
  readonly db: Data;
  /** The logger for the request. */
  readonly logger: Logger;
  /** The event emitter for the request. */
  readonly events: DictionaryEventEmitter;
}

export type MutContext = BaseContext<DataAccessor>;

export const MutContext = {
  from({db, events, logger}: Context): MutContext {
    return {db, events, logger};
  },
  /**
   * Performs the same task as `DataAccessor.transact`, but wraps the
   * DataWriter in a WriteContext. Properties other than `db` are taken from
   * the mutator context.
   *
   * See `DataAccessor.transact` for details.
   * @param callback The callback to call inside a transaction. It receives a
   *        WriteContext with a DataWriter.
   * @return A promise that resolves to the return value of the callback. The
   *         promise is rejected if an error occurs inside the callback, or if
   *         the database's underlying readers-writer lock is closed.
   */
  transact<R>(
    context: MutContext,
    callback: (ctx: WriteContext) => Awaitable<R>
  ): Promise<R> {
    const {db, events: parentEvents, logger} = context;
    return db.transact(async db => {
      // We must buffer events that occur during the transaction. If it fails,
      // we can't emit any of those events.
      const events = new DictionaryEventQueue();
      const result = await callback({db, events, logger});
      events.drainInto(parentEvents);
      return result;
    });
  },
} as const;

export type WriteContext = BaseContext<DataWriter>;

/** A value that can be awaited. */
export type Awaitable<T> = T | Promise<T>;

// NOTE: The below type is a generic version of various connection types from
// the GraphQL schema. It must be synchronised with the GraphQL schema.

/**
 * A generic connection type, matching the various GraphQL connections types
 * that exist in the schema. It must be synchronized with the GraphQL schema.
 */
export type ItemConnection<T> = {
  page: Pick<PageInfo, 'page' | 'perPage' | 'totalCount'>;
  nodes: T[];
};
