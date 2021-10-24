import {app} from 'electron';

import {Logger} from '@condict/server';

import debounce from './debounce';

/**
 * Persists some state.
 * @param shuttingDown True if the app is in the process of shutting down; true
 *        if the function is being called as part of a regular debounce.
 */
export type PersistFn = (shuttingDown: boolean) => void;

export type DebouncedFn = () => void;

/**
 * Delays execution of a function that persists something to the file system.
 * When the Electron app is about to quit, the function is invoked immediately,
 * to ensure the resource is persisted on exit.
 *
 * This is intended to be used with data that need to be saved occasionally,
 * such as configuration or the current session, where we don't want to invoke
 * the file system for every single change. In other words, it effectively
 * "batches" file system operations. Note that no arguments can be passed to the
 * `persist` function: the state to be persisted must be read from elsewhere.
 *
 * If an error occurs inside the `persist` function, it is caught and ignored,
 * and a message is written to the logger.
 * @param logger The logger to write error messages to.
 * @param logPrefix A prefix to add to the log output in case of an error.
 * @param persist A function that persists the state. This function should use
 *        synchronous file APIs, as errors in promises are not caught.
 */
const persistDebounced = (
  logger: Logger,
  logPrefix: string,
  persist: PersistFn
): DebouncedFn => {
  const persistLater = debounce(1000, () => {
    try {
      persist(false);
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      logger.error(`${logPrefix}: Error: ${e.message || e}`);
    }
  });
  let persistTimeout: NodeJS.Timeout | undefined = undefined;

  app.on('before-quit', () => {
    // We need to cancel any outstanding timeouts while the app quits, as we may
    // otherwise later end up trying to persist an object that has been GCed or
    // released in some other way. This can cause the V8 process to crash.
    if (persistTimeout) {
      clearTimeout(persistTimeout);
    }

    // Immediately invoke the persist function, and ignore any errors that occur
    // (we can't handle them meaningfully anyway).
    try {
      persist(true);
    } catch (e: any) {
      logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${logPrefix}: Error while saving during shutdown: ${e.message || e}`
      );
    }
  });

  return () => {
    persistTimeout = persistLater();
    // Allow Node to quit before the timeout has been fulfilled.
    persistTimeout.unref();
  };
};

export default persistDebounced;
