import {IpcMainInvokeEvent, app, dialog} from 'electron';

import {Logger} from '@condict/server';

import {ServerConfig, ExecuteOperationArg, OperationResult} from '../../types';

import ipc from '../ipc';

import LocalServer from './local-server';
import RemoteServer from './remote-server';
import {ServerImpl} from './types';

export type ReadyCallback = () => void;

export interface ServerInstance {
  readonly ready: boolean;
  onReady: ReadyCallback | null;
}

const serverImplFromConfig = (
  logger: Logger,
  config: ServerConfig,
  getSessionId: () => string | null
): ServerImpl => {
  switch (config.kind) {
    case 'local':
      return new LocalServer(logger, config);
    case 'remote':
      return new RemoteServer(config, getSessionId);
  }
};

const initServer = (
  logger: Logger,
  config: ServerConfig,
  getSessionId: () => string | null
): ServerInstance => {
  const server = serverImplFromConfig(logger, config, getSessionId);

  let ready = false;
  let onReady: ReadyCallback | null = null;

  const handleRequest = (
    _event: IpcMainInvokeEvent,
    arg: ExecuteOperationArg
  ): Promise<OperationResult<unknown>> => {
    if (!ready) {
      throw new Error('Server is not ready');
    }

    return server.execute(arg.operation, arg.variableValues);
  };

  ipc.handle('execute-operation', handleRequest);

  app.on('before-quit', e => {
    if (server.isStarted) {
      e.preventDefault();
      void server.stop()
        .catch(e => {
          logger.error(e instanceof Error ? e.message : String(e));
        })
        .then(() => app.quit());
    }
  });

  server.start()
    .then(() => {
      ready = true;
      if (onReady) {
        onReady();
        onReady = null;
      }
    })
    .catch(e => {
      const message = e instanceof Error ? e.message : String(e);
      logger.error(`Unable to start Condict server: ${message}`);
      dialog.showErrorBox(
        'Startup error',
        `An error occurred when starting Condict: ${message}`
      );
      app.quit();
    });

  return {
    get ready(): boolean {
      return ready;
    },

    get onReady(): ReadyCallback | null {
      return onReady;
    },
    set onReady(value: ReadyCallback | null) {
      onReady = value;
    },
  };
};

export default initServer;
