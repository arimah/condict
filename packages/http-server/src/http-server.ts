import http, {Server as HttpServer} from 'http';

import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import {
  ApolloServerPluginDrainHttpServer,
} from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import cors from 'cors';
import {customAlphabet} from 'nanoid';

import {CondictServer, ExecutionContext, Logger} from '@condict/server';

import ContextCleanupPlugin from './context-cleanup-plugin';
import WebSocketEventServer from './ws-event-server';
import getSessionId from './session-id';
import {HttpOptions, DictionaryEventDispatch} from './types';

const genRequestId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

/**
 * Implements a Condict server that responds to GraphQL requests over HTTP.
 */
export default class CondictHttpServer {
  private readonly logger: Logger;
  private readonly server: CondictServer;
  private readonly apollo: ApolloServer<ExecutionContext>;
  private readonly eventDispatch: DictionaryEventDispatch;
  private stopPromise: Promise<void> | null = null;

  private constructor(
    logger: Logger,
    server: CondictServer,
    apollo: ApolloServer<ExecutionContext>,
    eventDispatch: DictionaryEventDispatch
  ) {
    this.logger = logger;
    this.server = server;
    this.apollo = apollo;
    this.eventDispatch = eventDispatch;
  }

  /**
   * Gracefully shuts down the server.
   *
   * It is not possible to restart a server that has been shut down. Instead,
   * create a new CondictHttpServer.
   *
   * If the server has already been shut down, this function is a no-op.
   *
   * @return A promise that resolves when the server has completely shut down.
   *         The server will process any last requests before shutting down,
   *         after which point no more requests will be handled.
   */
  public stop(): Promise<void> {
    if (!this.stopPromise) {
      this.stopPromise = this.shutDown();
    }
    return this.stopPromise;
  }

  private async shutDown(): Promise<void> {
    const {logger} = this;
    logger.debug('Stopping server...');

    try {
      await this.eventDispatch.close();
    } catch (e: any) {
      logger.warn(`Error stopping event server: ${String(e)}`);
    }

    try {
      await this.apollo.stop();
    } catch (e: any) {
      logger.warn(`Error stopping Apollo server: ${String(e)}`);
    }

    // Apollo closes the HTTP server; no need to do that here.

    try {
      await this.server.stop();
    } catch (e: any) {
      logger.warn(`Error stopping Condict server: ${String(e)}`);
    }

    logger.info('Server stopped.');
  }

  /**
   * Starts a new Condict HTTP server.
   * @param server The underlying Condict server, containing the database and
   *        GraphQL schema. This server will be started if it isn't already
   *        running. Once the HTTP server shuts down, the Condict server will
   *        be stopped, regardless of its initial state.
   * @param config HTTP options.
   * @return A promise that resolves to the newly created HTTP server, which
   *         will be started and ready to receive incoming requests.
   */
  public static async startNew(
    server: CondictServer,
    config: HttpOptions
  ): Promise<CondictHttpServer> {
    const logger = server.getLogger();
    logger.info('Condict is starting');

    await server.start();

    const app = express();

    const httpServer = http.createServer(app);

    const apollo = new ApolloServer<ExecutionContext>({
      schema: server.getSchema(),
      plugins: [
        ApolloServerPluginDrainHttpServer({httpServer}),
        ContextCleanupPlugin(),
      ],
      // We handle these ourselves.
      stopOnTerminationSignals: false,
    });
    // The Apollo server must be started before passing it to expressMiddleware
    try {
      await apollo.start();
    } catch (e) {
      await ignoreReject(server.stop());
      throw e;
    }

    app.use(
      '/',
      cors(),
      express.json(),
      expressMiddleware(apollo, {
        context: ({req}) => server.getContextValue(
          getSessionId(req.headers),
          genRequestId()
        ),
      })
    );

    // TODO: Make the event server pluggable?
    const eventDispatch = new WebSocketEventServer(
      logger,
      httpServer,
      sessionId => server.isValidUserSession(sessionId)
    );
    server.addEventListener(eventDispatch.dispatchDictionaryEvents);

    try {
      await tryStartHttpServer(httpServer, config.port);
    } catch (e) {
      await ignoreReject(apollo.stop());
      await ignoreReject(server.stop());
      throw e;
    }

    return new CondictHttpServer(
      logger,
      server,
      apollo,
      eventDispatch
    );
  }
}

const ignoreReject = (promise: Promise<void>): Promise<void> =>
  promise.catch(() => { /* ignore */ });

const tryStartHttpServer = (httpServer: HttpServer, port: number): Promise<void> =>
  new Promise((resolve, reject) => {
    httpServer.on('error', reject);
    httpServer.listen(port, () => {
      httpServer.off('error', reject);
      resolve();
    });
  });
