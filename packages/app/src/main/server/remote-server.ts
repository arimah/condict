import fetch, {Response} from 'node-fetch';

import {RemoteServerConfig, OperationResult, VariableValues} from '../../types';

import {ServerImpl} from './types';

export default class RemoteServer implements ServerImpl {
  private readonly url: string;
  private readonly getSessionId: () => string | null;
  private started = false;

  public constructor(
    config: RemoteServerConfig,
    getSessionId: () => string | null
  ) {
    this.url = config.url;
    this.getSessionId = getSessionId;
  }

  public get isStarted(): boolean {
    return this.started;
  }

  public start(): Promise<void> {
    this.started = true;
    return Promise.resolve();
  }

  public stop(): Promise<void> {
    this.started = false;
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
          'X-Condict-Session-Id': this.getSessionId() || '-',
        },
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return error(`Could not fetch from remote server: ${e.message || e}`);
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return error(`Could not parse response as JSON: ${e.message || e}`);
    }

    if (typeof json !== 'object' || json == null || Array.isArray(json)) {
      return error(`Expected an object, got ${describeType(json)}`);
    }

    // TODO: Additional response validation?
    return json;
  }
}

const error = (message: string): OperationResult<unknown> => ({
  data: null,
  errors: [{message}],
});

const describeType = (value: any): string =>
  value === null ? 'null' :
  Array.isArray(value) ? 'array' :
  typeof value;
