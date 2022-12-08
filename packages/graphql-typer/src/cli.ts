import fs from 'fs';
import path from 'path';

import parseCliArgs, {OptionDefinition} from 'command-line-args';
import {watch} from 'chokidar';
import {GraphQLSchema} from 'graphql';

import {buildGraphqlSchema, defineServerTypes, defineClientTypes} from './index.js';
import debounce from './debounce';

const options: OptionDefinition[] = [
  {name: 'help', alias: 'h', type: Boolean},

  {name: 'schema-dir', alias: 's', type: String},
  {
    name: 'target',
    alias: 't',
    type: value => {
      switch (value.toLowerCase()) {
        case 'server':
        case 'client':
          return value;
        default:
          throw new Error(`Expected '--target=server' or '--target=client', got: ${value}`);
      }
    },
  },
  {name: 'watch', alias: 'w', type: Boolean},

  // Server only
  {name: 'output', alias: 'o', type: String},

  // Client only
  {name: 'src', type: String},
  {name: 'defs', alias: 'd', type: String},
];

const usage = () => {
  console.log(
    `Usage:\n` +
    `  condict-graphql-typer --schema-dir=<schema-dir> --target=server --output=<output-file>\n` +
    `                        [--watch]\n` +
    `  condict-graphql-typer --schema-dir=<schema-dir> --target=client \\\n` +
    `                        --src=<src-dir> --defs=<defs-file> [--watch]\n` +
    `  condict-graphql-typer --help\n` +
    `\n` +
    `Options:\n` +
    `-s <schema-dir>\n` +
    `--schema-dir=<schema-dir>\n` +
    `        The directory from which GraphQL schema definitions are read. The schema\n` +
    `        is constructed from every '*.graphql' file found in this directory, which\n` +
    `        is searched recursively.\n` +
    `\n` +
    `-t (server|client)\n` +
    `--target=(server|client)\n` +
    `        server: Generate schema type definitions.\n` +
    `        client: Generate type definitions for operation results.\n` +
    `\n` +
    `-o <output-file>\n` +
    `--output=<output-file>\n` +
    `        Server only. The path to the file that receives the schema types.\n` +
    `\n` +
    `--src=<src-dir>\n` +
    `        Client only. The source directory that is searched for client '*.graphql'\n` +
    `        files. Every file named 'query.graphql' contains one or more operations\n` +
    `        (queries, mutations, subscriptions) and receives a generated 'query.ts' in\n` +
    `        the same directory. All other .graphql files are expected to contain fragment\n` +
    `        definitions, which are made available to all operations across the codebase.\n` +
    `\n` +
    `-d <defs-file>\n` +
    `--defs=<defs-file>\n` +
    `        Client only. The path to the shared definitions file, which will receive\n` +
    `        generated definitions for the 'IdOf', 'Query', 'QueryArgs' and 'QueryResult'\n` +
    `        types as well as enum, input and custom ID types.\n` +
    `\n` +
    `-w\n` +
    `--watch\n` +
    `        Starts in watch mode. Type definitions are rebuilt as input files change.\n` +
    `\n` +
    `-h\n` +
    `--help\n` +
    `        Shows this screen.`
  );
};

const main = () => {
  const args = parseCliArgs(options);

  if (args.help) {
    usage();
    return;
  }

  const schemaDir = args['schema-dir'] as string | undefined;
  const target = args.target as 'server' | 'client' | undefined;
  if (!schemaDir || !target) {
    console.error('Both --schema-dir/-s and --target/-t must be specified');
    process.exitCode = 1;
    return;
  }

  const watch = args.watch as boolean | undefined;

  try {
    switch (target) {
      case 'server': {
        const output = args.output as string | undefined;
        if (!output) {
          console.error('--output must be specified for --target=server');
          process.exitCode = 1;
          return;
        }

        if (watch) {
          watchServerTypes(schemaDir, output);
        } else {
          const schema = buildGraphqlSchema(schemaDir);
          writeServerTypes(schema, output);
        }
        break;
      }
      case 'client': {
        let srcDir = args.src as string | undefined;
        let sharedDefsFile = args.defs as string | undefined;
        if (!srcDir || !sharedDefsFile) {
          console.error('Both --src and --defs must be specified for --target=client');
          process.exitCode = 1;
          return;
        }

        srcDir = path.resolve(srcDir);
        sharedDefsFile = path.resolve(sharedDefsFile);

        if (watch) {
          watchClientTypes(schemaDir, sharedDefsFile, srcDir);
        } else {
          const schema = buildGraphqlSchema(schemaDir);
          defineClientTypes(schema, sharedDefsFile, srcDir);
        }
        break;
      }
    }
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.error((e as any).message);
    process.exitCode = 1;
    return;
  }
};

const writeServerTypes = (schema: GraphQLSchema, targetFile: string) => {
  const definitions = defineServerTypes(schema);
  fs.writeFileSync(targetFile, definitions, {encoding: 'utf-8'});
};

const watchServerTypes = (schemaDir: string, targetFile: string) => {
  watchSchema(schemaDir, schema => {
    try {
      writeServerTypes(schema, targetFile);
      console.log('Rebuilt GraphQL types (server-side)');
    } catch (e) {
      console.error('Error writing server types:', e);
    }
  });
};

const watchClientTypes = (
  schemaDir: string,
  sharedDefsFile: string,
  srcDir: string
) => {
  let schema: GraphQLSchema | null = null;

  const rebuild = debounce(100, () => {
    if (schema) {
      try {
        defineClientTypes(schema, sharedDefsFile, srcDir);
        console.log('Rebuilt GraphQL types (client-side)');
      } catch (e) {
        console.error('Error building client types:', e);
      }
    }
  });

  watchSchema(schemaDir, newSchema => {
    schema = newSchema;
    rebuild();
  });

  // Chokidar globs require forward slashes, not backslashes.
  srcDir = srcDir.replace(/\\/g, '/');
  watch(`${srcDir}/**/*.graphql`, {
    // We will rebuild as soon as the schema is read.
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
    },
  }).on('all', rebuild);
};

const watchSchema = (
  schemaDir: string,
  onChange: (schema: GraphQLSchema) => void
) => {
  // Chokidar globs require forward slashes, not backslashes.
  schemaDir = schemaDir.replace(/\\g/, '/');

  const handleChange = debounce(250, () => {
    let schema: GraphQLSchema;
    try {
      schema = buildGraphqlSchema(schemaDir);
    } catch (e) {
      console.error('Error in GraphQL schema:', e);
      return;
    }

    onChange(schema);
  });

  watch(`${schemaDir}/**/*.graphql`, {
    awaitWriteFinish: {
      stabilityThreshold: 1000,
    },
  }).on('all', handleChange);
};

main();
