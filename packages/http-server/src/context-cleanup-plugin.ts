import {ApolloServerPlugin, GraphQLRequestContext} from '@apollo/server';

import {ExecutionContext} from '@condict/server';

/**
 * An Apollo server plugin that calls the `finish` function on the context value
 * when the request is finished. The plugin also emits a small amount of logging
 * around each request, to assist with debugging.
 */
export default function ContextCleanupPlugin(): ApolloServerPlugin<ExecutionContext> {
  return {
    requestDidStart: (req: GraphQLRequestContext<ExecutionContext>) => {
      const {contextValue} = req;

      const startTime = Date.now();
      contextValue.logger.debug(`Start request`);

      return Promise.resolve({
        willSendResponse() {
          const requestTime = Date.now() - startTime;
          contextValue.logger.verbose(`Request finished in ${requestTime} ms`);
          contextValue.finish();
          return Promise.resolve();
        },
      });
    },
  };
}
