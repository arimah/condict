import {
  ServerConfig,
  LoggerOptions,
  DictionaryEventBatch,
} from '@condict/server';

/** Contains configuration for the HTTP server. */
export interface HttpOptions {
  /**
   * The port number that the HTTP server will listen on. This value must be
   * between 1 and 65535, inclusive.
   */
  readonly port: number;
}

export interface HttpServerConfig extends ServerConfig {
  /** Logger configuration. */
  readonly log: LoggerOptions;
  /** HTTP server configuration. */
  readonly http: HttpOptions;
}

export interface DictionaryEventDispatch {
  /**
   * Dispatches a batch of dictionary events to all attached listeners.
   *
   * @param batch The batch of events to send.
   */
  readonly dispatchDictionaryEvents: (batch: DictionaryEventBatch) => void;

  /**
   * Closes the event dispatch. This is called when the server is shutting
   * down and must perform appropriate cleanup, e.g. disconnecting clients.
   *
   * @return A promise that resolves when the event dispatch is fully closed.
   */
  close(): Promise<void>;
}
