import {Server as HttpServer} from 'http';

import {ApolloServer} from 'apollo-server';
import {customAlphabet} from 'nanoid';

import CondictServer from './server';
import {Context} from './graphql';
import {Logger} from './types';

/** Contains information about a running HTTP server. */
export interface ServerInfo {
  /** The URL that the server is running on. */
  url: string;
}

const genRequestId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

/**
 * Implements a Condict server that listens for connections over HTTP. This
 * class is primarily intended for the CLI server, for standalone setups.
 */
export default class CondictHttpServer {
  private readonly server: CondictServer;
  private readonly logger: Logger;
  private readonly apolloServer: ApolloServer;
  private httpServer: HttpServer | null = null;

  /**
   * Creates a new Condict HTTP server.
   * @param server The Condict server to wrap.
   */
  public constructor(server: CondictServer) {
    this.server = server;
    this.logger = server.getLogger();

    this.apolloServer = new ApolloServer({
      schema: server.getSchema(),
      rootValue: null,
      context: async ({req, res}): Promise<Context> => {
        const {logger, server} = this;

        const requestId = genRequestId();
        const startTime = Date.now();
        logger.info(`Start request ${requestId}`);

        const {context, finish} = await server.getContextValue(
          req.header('x-condict-session-id')
        );
        res.once('finish', () => {
          const requestTime = Date.now() - startTime;
          logger.info(`Request ${requestId} finished in ${requestTime} ms`);
          void finish();
        });

        return context;
      },
    });
  }

  /**
   * Starts the HTTP server. If the server is already running, this function
   * throws an error.
   * @return A promise that resolves when the server is running. The value
   *         contains information about the running server.
   */
  public async start(): Promise<ServerInfo> {
    if (this.httpServer) {
      throw new Error('Server is already running');
    }

    const {logger, server} = this;
    logger.info('Condict is starting!');

    await server.start();

    const {url, server: httpServer} = await this.apolloServer.listen();
    this.httpServer = httpServer;

    return {url};
  }

  /**
   * Stops the server. If the server is already stopped, this function is a
   * no-op.
   * @return A promise that resolves when the server is stopped.
   */
  public async stop(): Promise<void> {
    if (this.httpServer) {
      this.logger.info('Stopping HTTP server...');
      this.httpServer.close();
      this.httpServer = null;
    }

    await this.server.stop();
  }
}
