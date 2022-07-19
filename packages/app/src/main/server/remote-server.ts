import fetch, {Response} from 'node-fetch';
import WebSocket from 'ws';

import {
  Logger,
  DictionaryEventListener,
  DictionaryEventBatch,
} from '@condict/server';

import {RemoteServerConfig, OperationResult, VariableValues} from '../../types';

import {parseEventBatch, isObject, describeType} from './parse-json';
import {ServerImpl} from './types';

const SessionIdHeader = 'X-Condict-Session-Id';

// TODO: Reconnect to WebSocket server when the user logs in.

export default class RemoteServer implements ServerImpl {
  private readonly logger: Logger;
  private readonly url: string;
  private readonly getSessionId: () => string | null;
  private started = false;
  private eventSocket: WebSocket | null = null;
  private readonly eventListeners = new Set<DictionaryEventListener>();

  public constructor(
    logger: Logger,
    config: RemoteServerConfig,
    getSessionId: () => string | null
  ) {
    this.logger = logger;
    this.url = config.url;
    this.getSessionId = getSessionId;
  }

  public get isStarted(): boolean {
    return this.started;
  }

  public start(): Promise<void> {
    this.started = true;
    this.connectEventSocket();
    return Promise.resolve();
  }

  public stop(): Promise<void> {
    this.started = false;
    this.eventSocket?.close();
    this.eventSocket = null;
    return Promise.resolve();
  }

  public async execute(
    operation: string,
    variableValues: VariableValues
  ): Promise<OperationResult<unknown>> {
    const body = JSON.stringify({
      operationName: null,
      query: operation,
      variables: variableValues,
    });

    let response: Response;
    try {
      response = await fetch(this.url, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          [SessionIdHeader]: this.getSessionId() ?? '-',
        },
      });
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return error(`Could not fetch from remote server: ${e.message || e}`);
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return error(`Could not parse response as JSON: ${e.message || e}`);
    }

    if (!isObject(json)) {
      return error(`Expected an object, got ${describeType(json)}`);
    }

    // TODO: Additional response validation?
    return json;
  }

  public addEventListener(listener: DictionaryEventListener): void {
    this.eventListeners.add(listener);
  }

  public removeEventListener(listener: DictionaryEventListener): void {
    this.eventListeners.delete(listener);
  }

  private connectEventSocket() {
    // If there is already a connection, close it.
    if (this.eventSocket) {
      this.eventSocket.close();
      this.eventSocket = null;
    }

    const sessionId = this.getSessionId();
    if (sessionId) {
      this.eventSocket = new WebSocket(getEventsUrl(this.url), {
        headers: {
          [SessionIdHeader]: sessionId,
        },
      });
      this.eventSocket.once('close', this.handleEventSocketClose);
      this.eventSocket.on('message', this.handleEvent);
    }
  }

  private handleEvent = (data: WebSocket.Data) => {
    let batch: DictionaryEventBatch;
    try {
      const text = getTextFromData(data);
      const json: unknown = JSON.parse(text);
      batch = parseEventBatch(json);
    } catch (e: any) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Could not parse WebSocket message as event batch: ${e.message || e}`
      );
      return;
    }

    this.eventListeners.forEach(listener => {
      listener(batch);
    });
  };

  private handleEventSocketClose = () => {
    // TODO: Use the disconnect code to determine whether we can reconnect and
    // how often to try.
    if (this.eventSocket) {
      this.eventSocket.off('message', this.handleEvent);
      this.eventSocket = null;
    }

    // Try to reconnect to the event stream.
    this.connectEventSocket();
  };
}

const error = (message: string): OperationResult<unknown> => ({
  data: null,
  errors: [{message}],
});

const getEventsUrl = (serverUrl: string): URL => {
  const baseUrl = new URL(serverUrl);
  if (!baseUrl.pathname.endsWith('/')) {
    baseUrl.pathname += '/';
  }
  return new URL('./events', baseUrl);
};

const getTextFromData = (data: WebSocket.Data): string => {
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString('utf-8');
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString('utf-8');
  }
  if (Buffer.isBuffer(data)) {
    return data.toString('utf-8');
  }
  return data;
};
