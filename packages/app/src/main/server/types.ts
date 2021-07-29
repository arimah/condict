import {DictionaryEventListener} from '@condict/server';

import {OperationResult, VariableValues} from '../../types';

export interface ServerImpl {
  /** Determines whether the server is started. */
  readonly isStarted: boolean;

  /**
   * Starts the server. If the server is already running, returns or resolves
   * immediately.
   */
  start(): Promise<void>;

  /**
   * Stops the server. If the server is not running, returns or resolves
   * immediately.
   */
  stop(): Promise<void>;

  /**
   * Executes a GraphQL operation.
   * @param operaton The operation to execute. Multi-operation documents are not
   *        supported.
   * @param variableValues Values to assign to GraphQL variables.
   * @return A promise that resolves to an execution result. The promise is only
   *         rejected if an unexpected error occurs.
   */
  execute(
    operation: string,
    variableValues: VariableValues | null
  ): Promise<OperationResult<unknown>>;

  /**
   * Adds an event listener to the server. The event listener is invoked when
   * dictionary events are emitted, and receives a batch of one or more events.
   *
   * This method can safely be called before the server has started and after
   * the server has been stopped.
   * @param listener The listener function to add.
   */
  addEventListener(listener: DictionaryEventListener): void;

  /**
   * Removes an event listener from the server.
   *
   * This method can safely be called before the server has started and after
   * the server has been stopped.
   * @param listener The listener function to remove.
   */
  removeEventListener(listener: DictionaryEventListener): void;
}
