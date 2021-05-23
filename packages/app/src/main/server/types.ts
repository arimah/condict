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
}
