import {GraphQLError} from 'graphql';

import {
  CondictServer,
  Logger,
  DictionaryEventListener,
  executeLocalOperation,
} from '@condict/server';

import {
  LocalServerConfig,
  VariableValues,
  OperationResult,
  ExecuteError,
} from '../../types';

import {ServerImpl} from './types';

export default class LocalServer implements ServerImpl {
  private readonly server: CondictServer;

  public constructor(logger: Logger, config: LocalServerConfig) {
    this.server = new CondictServer(logger, config);
  }

  public get isStarted(): boolean {
    return this.server.isRunning();
  }

  public start(): Promise<void> {
    return this.server.start();
  }

  public stop(): Promise<void> {
    return this.server.stop();
  }

  public async execute(
    operation: string,
    variableValues: VariableValues
  ): Promise<OperationResult<unknown>> {
    const {data, errors} = await executeLocalOperation(
      this.server,
      operation,
      variableValues
    );
    if (errors) {
      return {data, errors: convertErrors(errors)};
    }
    return {data};
  }

  public addEventListener(listener: DictionaryEventListener): void {
    this.server.addEventListener(listener);
  }

  public removeEventListener(listener: DictionaryEventListener): void {
    this.server.removeEventListener(listener);
  }
}

const convertErrors = (errors: readonly GraphQLError[]): ExecuteError[] =>
  errors.map<ExecuteError>(e => ({
    message: e.message,
    path: e.path,
    locations: e.locations,
    extensions: e.extensions,
  }));
