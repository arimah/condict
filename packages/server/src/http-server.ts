import {Server as HttpServer} from 'http';

import {ApolloServer} from 'apollo-server';

import genId from '@condict/gen-id';

import CondictServer from './server';
import {Context} from './graphql';
import {Logger} from './types';

export type ServerInfo = {
  url: string;
};

export default class CondictHttpServer {
  private readonly server: CondictServer;
  private readonly logger: Logger;
  private readonly apolloServer: ApolloServer;
  private httpServer: HttpServer | null = null;

  public constructor(server: CondictServer) {
    this.server = server;
    this.logger = server.getLogger();

    this.apolloServer = new ApolloServer({
      schema: server.getSchema(),
      context: async ({res}): Promise<Context> => {
        const {logger, server} = this;

        const requestId = genId();
        const startTime = Date.now();
        logger.info(`Start request ${requestId}`);

        const {context, finish} = await server.getContextValue();
        res.once('finish', () => {
          const requestTime = Date.now() - startTime;
          logger.info(`Request ${requestId} finished in ${requestTime} ms`);
          finish();
        });

        return context;
      },
    });
  }

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

  public async stop(): Promise<void> {
    if (this.httpServer) {
      this.logger.info('Stopping HTTP server...');
      this.httpServer.close();
      this.httpServer = null;
    }

    await this.server.stop();
  }
}
