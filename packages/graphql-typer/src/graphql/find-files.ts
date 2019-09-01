import fs, {Dirent} from 'fs';
import path from 'path';

const isGraphqlFile = (entry: Dirent) =>
  entry.isFile() &&
  entry.name.endsWith('.graphql');

/**
 * Searches the specified directory recursively for '.graphql' files. This
 * function runs synchronously.
 * @param dir The directory to search.
 * @return An array of matching file names.
 */
const findAllGraphqlFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, {withFileTypes: true});

  return entries.reduce(
    (graphqlFiles: string[], entry: Dirent) => {
      const entryPath = path.join(dir, entry.name);

      // Search nested directories recursively.
      if (entry.isDirectory()) {
        return graphqlFiles.concat(findAllGraphqlFiles(entryPath));
      }

      if (isGraphqlFile(entry)) {
        graphqlFiles.push(entryPath);
      }
      return graphqlFiles;
    },
    [] as string[]
  );
};

export default findAllGraphqlFiles;
