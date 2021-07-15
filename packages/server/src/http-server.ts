import {ApolloServer} from 'apollo-server';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import {GraphQLRequestContext} from 'apollo-server-plugin-base';
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
  private apolloServerStarted = false;

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
      context: ({req}) => this.server.getContextValue(
        req.header('x-condict-session-id'),
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

    await server.start();

    const {url} = await this.apolloServer.listen();
    this.apolloServerStarted = true;

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
      try {
        await this.apolloServer.stop();
      } catch (e) {
        this.logger.error(`Error stopping HTTP server: ${e}`);
      }
      this.apolloServerStarted = false;
      this.logger.debug('HTTP server stopped.');
    }
    await this.server.stop();
  }
}
