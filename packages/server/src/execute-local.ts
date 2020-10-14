import {ExecutionResult, GraphQLError, parse, validate, execute} from 'graphql';
import {ApolloError} from 'apollo-server';

import CondictServer, {LocalSession} from './server';

/**
 * Executes a GraphQL operation against a local server. The operation is assumed
 * to be trusted, so all mutations are permitted.
 * @param server The server to execute the operation on.
 * @param operation The GraphQL operation string. Only a single operation may be
 *        contained in this document.
 * @param variableValues Variable values to be included in the operation.
 * @return A promise that resolves with the result of the operation. The promise
 *         is rejected if the server is not running.
 */
const executeLocalOperation = async (
  server: CondictServer,
  operation: string,
  variableValues: Record<string, any> | null
): Promise<ExecutionResult<unknown>> => {
  const {context, finish} = await server.getContextValue(LocalSession);
  const schema = server.getSchema();

  try {
    const document = parse(operation);

    const validationErrors = validate(schema, document);
    if (validationErrors.length > 0) {
      return {data: null, errors: validationErrors};
    }

    return await execute({
      schema,
      document,
      variableValues,
      contextValue: context,
    });
  } catch (e) {
    if (e instanceof GraphQLError || e instanceof ApolloError) {
      return {data: null, errors: [e]};
    } else {
      throw e;
    }
  } finally {
    await finish();
  }
};

export default executeLocalOperation;
