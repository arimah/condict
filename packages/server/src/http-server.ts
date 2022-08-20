import {IncomingMessage, Server as HttpServer} from 'http';
import {Socket} from 'net';

import {ApolloServer} from 'apollo-server';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import {GraphQLRequestContext} from 'apollo-server-plugin-base';
import {customAlphabet} from 'nanoid';
import {Server as WebSocketServer} from 'ws';

import CondictServer from './server';
import {Context} from './graphql';
import {DictionaryEventBatch} from './event';
import {HttpOptions, Logger} from './types';

/** Contains information about a running HTTP server. */
export interface ServerInfo {
  /** The URL that the server is running on. */
  url: string;
}

/** The custom header to get the Condict session ID from. */
const SessionIdHeader = 'x-condict-session-id';

/** How often to ping WebSocket clients to keep the connection alive (ms). */
const WsPingFrequency = 240000; // 4 minutes

const genRequestId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

/**
 * Implements a Condict server that listens for connections over HTTP. This
 * class is primarily intended for the CLI server, for standalone setups.
 */
export default class CondictHttpServer {
  private readonly server: CondictServer;
  private readonly logger: Logger;
  private readonly port: number;
  private readonly apolloServer: ApolloServer;
  private apolloServerStarted = false;
  private webSocketServer: WebSocketServer | null = null;
  private webSocketPingTimeout: NodeJS.Timeout | null = null;

  /**
   * Creates a new Condict HTTP server.
   * @param server The Condict server to wrap.
   */
  public constructor(server: CondictServer, config: HttpOptions) {
    this.server = server;
    this.logger = server.getLogger();
    this.port = config.port;

    this.apolloServer = new ApolloServer({
      schema: server.getSchema(),
      rootValue: null,
      context: ({req}) => this.server.getContextValue(
        req.header(SessionIdHeader),
        genRequestId()
      ),
      plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground(),
        {
          requestDidStart: (req: GraphQLRequestContext<Context>) => {
            const {context} = req;

            const startTime = Date.now();
            context.logger.verbose(`Start request`);

            return Promise.resolve({
              willSendResponse() {
                const requestTime = Date.now() - startTime;
                context.logger.verbose(`Request finished in ${requestTime} ms`);
                req.context.finish();
                return Promise.resolve();
              },
            });
          },
        },
      ],
      // We handle these ourselves.
      stopOnTerminationSignals: false,
    });
  }

  /**
   * Starts the HTTP server. If the server is already running, this function
   * throws an error.
   * @return A promise that resolves when the server is running. The value
   *         contains information about the running server.
   */
  public async start(): Promise<ServerInfo> {
    if (this.apolloServerStarted) {
      throw new Error('The server is already running');
    }

    const {logger, server} = this;
    logger.info('Condict is starting!');

    server.addEventListener(this.handleDictionaryEvent);

    await server.start();

    const {url, server: httpServer} = await this.apolloServer.listen({
      port: this.port,
    });
    this.apolloServerStarted = true;

    this.createWebSocketServer(httpServer);

    return {url};
  }

  /**
   * Stops the server. If the server is already stopped, this function is a
   * no-op.
   * @return A promise that resolves when the server is stopped.
   */
  public async stop(): Promise<void> {
    if (this.apolloServerStarted) {
      this.logger.debug('Stopping HTTP server...');

      if (this.webSocketServer) {
        this.webSocketServer.close();

        if (this.webSocketPingTimeout !== null) {
          clearInterval(this.webSocketPingTimeout);
        }
      }

      try {
        await this.apolloServer.stop();
      } catch (e) {
        this.logger.error(`Error stopping HTTP server: ${String(e)}`);
      }


      this.apolloServerStarted = false;
      this.logger.debug('HTTP server stopped.');
    }

    this.server.removeEventListener(this.handleDictionaryEvent);
    await this.server.stop();
  }

  /**
   * Creates the WebSocket server. This method is called after the server has
   * been started, which is where we get the HTTP server.
   * @param httpServer The HTTP server to listen on.
   */
  private createWebSocketServer(httpServer: HttpServer): void {
    const {logger} = this;

    // The use of verifyClient on WebSocketServer is discouraged, so we
    // implement our own authentication here.
    const wss = new WebSocketServer({
      noServer: true,
      clientTracking: true,
    });

    httpServer.on('upgrade', (
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
          ? this.server.isValidUserSession(sessionId)
          : Promise.resolve(false);

      isValidSessionPromise.then(isValidSession => {
        if (!isValidSession) {
          return failUpgrade(socket, '403 Forbidden', 'Invalid user session');
        }

        wss.handleUpgrade(request, socket, head, connection => {
          wss.emit('connection', connection, request);
        });
      }, e => {
        failUpgrade(
          socket,
          '500 Internal Server Error',
          `Could not validate user session: ${e}`
        );
      });
    });

    wss.on('connection', connection => {
      logger.debug('Accepted WebSocket connection');

      if (wss.clients.size === 1) {
        // This is the first active connection. Start periodically pinging
        // active clients. `unref()` allows Node to end the process even if
        // the interval is still active.
        this.webSocketPingTimeout = setInterval(
          this.pingWebSocketClients,
          WsPingFrequency
        ).unref();
      }

      connection.on('close', () => {
        if (wss.clients.size === 0) {
          logger.debug('Lost last WebSocket connection');

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          clearInterval(this.webSocketPingTimeout!);
          this.webSocketPingTimeout = null;
        }
      });
    });

    this.webSocketServer = wss;
  }

  /**
   * Pings every active WebSocket client, to keep the connection alive.
   */
  private pingWebSocketClients = (): void => {
    this.webSocketServer?.clients.forEach(client => {
      try {
        client.ping();
      } catch (_e) {
        // ignore
      }
    });
  };

  /**
   * Sends a dictionary event batch to all attached WebSocket clients.
   * @param batch The batch to send.
   */
  private handleDictionaryEvent = (batch: DictionaryEventBatch): void => {
    const wss = this.webSocketServer;
    if (!wss || wss.clients.size === 0) {
      return;
    }

    const data = JSON.stringify(batch);
    this.webSocketServer?.clients.forEach(client => {
      try {
        client.send(data);
      } catch (e) {
        this.logger.warn(
          `Error sending event batch to WS client: ${String(e)}`
        );
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
