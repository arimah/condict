import fs, {Dirent} from 'fs';
import path from 'path';

const isGraphqlFile = (entry: Dirent) =>
  entry.isFile() &&
  entry.name.endsWith('.graphql');

const findGraphqlFilesImpl = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, {withFileTypes: true});

  return entries.reduce(
    (graphqlFiles: string[], entry: Dirent) => {
      const entryPath = path.join(dir, entry.name);

      // Search nested directories recursively.
      if (entry.isDirectory()) {
        return graphqlFiles.concat(findGraphqlFilesImpl(entryPath));
      }

      if (isGraphqlFile(entry)) {
        graphqlFiles.push(entryPath);
      }
      return graphqlFiles;
    },
    [] as string[]
  );
};

/**
 * Searches the specified directory recursively for '.graphql' files. This
 * function runs synchronously. Matching paths are sorted alphabetically.
 * @param dir The directory to search.
 * @return An array of matching file paths (name + directory).
 */
const findAllGraphqlFiles = (dir: string): string[] =>
  findGraphqlFilesImpl(dir).sort();

export default findAllGraphqlFiles;
