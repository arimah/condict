import {IncomingMessage, Server as HttpServer} from 'http';
import {Socket} from 'net';

import WebSocket, {WebSocketServer} from 'ws';

import {Logger, DictionaryEventBatch} from '@condict/server';

import {SessionIdHeader} from './constants';
import {DictionaryEventDispatch} from './types';

export type ValidateSessionFn = (sessionId: string) => Promise<boolean>;

/** How often to ping WebSocket clients to keep the connection alive (ms). */
const PingFrequency = 240000; // 4 minutes

/**
 * Implements a dictionary event dispatch that operates over WebSocket. The
 * event server attaches to an existing HTTP server, sets up a listener for
 * the `upgrade` event, and manages everything related to WebSocket clients.
 */
export default class WebSocketEventServer implements DictionaryEventDispatch {
  private readonly logger: Logger;
  private readonly isValidSession: ValidateSessionFn;
  private readonly wss: WebSocketServer;
  private pingTimeout: NodeJS.Timeout | null = null;

  public constructor(
    logger: Logger,
    httpServer: HttpServer,
    isValidSession: ValidateSessionFn
  ) {
    this.logger = logger;
    this.isValidSession = isValidSession;
    // The use of verifyClient on WebSocketServer is discouraged, so we
    // implement our own authentication.
    this.wss = new WebSocketServer({
      noServer: true,
      clientTracking: true,
    });
    this.wss.on('connection', this.handleConnection);

    httpServer.on('upgrade', this.handleUpgrade);
  }

  public readonly dispatchDictionaryEvents = (
    batch: DictionaryEventBatch
  ): void => {
    if (this.wss.clients.size === 0) {
      return;
    }

    const data = JSON.stringify(batch);
    this.wss.clients.forEach(client => {
      try {
        client.send(data);
      } catch (e) {
        this.logger.warn(
          `Error sending event batch to WS client: ${String(e)}`
        );
      }
    });
  };

  public close(): Promise<void> {
    if (this.pingTimeout !== null) {
      clearInterval(this.pingTimeout);
      this.pingTimeout = null;
    }
    return new Promise(resolve => {
      this.wss.close(() => resolve());
    });
  }

  private handleUpgrade = (
    request: IncomingMessage,
    socket: Socket,
    head: Buffer
  ) => {
    // request.url is defined on requests that come from http.Server.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!/^\/events\/?$/.test(request.url!)) {
      return failUpgrade(
        socket,
        '400 Bad Request',
        'Invalid request URL for upgrade'
      );
    }

    const sessionId = request.headers[SessionIdHeader];
    const isValidSessionPromise =
      typeof sessionId === 'string'
        ? this.isValidSession(sessionId)
        : Promise.resolve(false);

    isValidSessionPromise.then(isValidSession => {
      if (!isValidSession) {
        return failUpgrade(socket, '403 Forbidden', 'Invalid user session');
      }

      this.wss.handleUpgrade(request, socket, head, connection => {
        this.wss.emit('connection', connection, request);
      });
    }, e => {
      failUpgrade(
        socket,
        '500 Internal Server Error',
        `Could not validate user session: ${e}`
      );
    });
  };

  private handleConnection = (connection: WebSocket): void => {
    this.logger.debug('Accepted WebSocket connection');

    if (this.wss.clients.size === 1) {
      // This is the first active connection. Start periodically pinging
      // active clients. `unref()` allows Node to end the process even if
      // the interval is still active.
      this.pingTimeout = setInterval(this.pingClients, PingFrequency).unref();
    }

    connection.on('close', () => {
      if (this.wss.clients.size === 0) {
        this.logger.debug('Lost last WebSocket connection');

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clearInterval(this.pingTimeout!);
        this.pingTimeout = null;
      }
    });
  };

  /**
   * Pings every active WebSocket client, to keep the connection alive.
   */
  private pingClients = (): void => {
    this.wss.clients.forEach(client => {
      try {
        client.ping();
      } catch (_e) {
        // ignore
      }
    });
  };
}

const failUpgrade = (
  socket: Socket,
  status: string,
  message: string
): void => {
  socket.write(
    `HTTP/1.1 ${status}\r\n` +
    'Connection: close\r\n' +
    'Content-Type: text/plain\r\n' +
    `Content-Length: ${Buffer.byteLength(message, 'utf-8')}\r\n` +
    '\r\n' +
    message
  );
  socket.destroy();
};
