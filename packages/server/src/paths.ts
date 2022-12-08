import url from 'url';
import path from 'path';

export const getServerRootDir = (): string =>
  path.dirname(
    path.dirname(
      url.fileURLToPath(import.meta.url)
    )
  );

export const getGraphqlSchemaDir = (): string =>
  path.join(getServerRootDir(), 'graphql-schema');
