#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import parseCliArgs, {OptionDefinition} from 'command-line-args';

import {buildGraphqlSchema, defineServerTypes, defineClientTypes} from '.';

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

  // Server only
  {name: 'output', alias: 'o', type: String},

  // Client only
  {name: 'src', type: String},
  {name: 'defs', alias: 'd', type: String},
];

const usage = () => {
  console.log(
    `Usage:\n` +
    `  condict-graphql-typer --schema-dir=SCHEMA_DIR --target=server --output=OUTPUT_FILE\n` +
    `  condict-graphql-typer --schema-dir=SCHEMA_DIR --target=client \\\n` +
    `                        --src=SRC_DIR --defs=DEFS_FILE\n` +
    `  condict-graphql-typer --help\n` +
    `\n` +
    `Options:\n` +
    `--schema-dir=SCHEMA_DIR  (alias: -s)\n` +
    `        The directory from which GraphQL schema definitions are read. The schema\n` +
    `        is constructed from every '*.graphql' file found in this directory, which\n` +
    `        is searched recursively.\n` +
    `\n` +
    `--target=<server|client>  (alias: -t)\n` +
    `        server: Generate schema type definitions.\n` +
    `        client: Generate type definitions for operation results.\n` +
    `\n` +
    `--output=OUTPUT_FILE  (alias: -o)\n` +
    `        Server only. The path to the file that receives the schema types.\n` +
    `\n` +
    `--src=SRC_DIR\n` +
    `        Client only. The source directory that is searched for client '*.graphql'\n` +
    `        files. Every file named 'query.graphql' contains one or more operations\n` +
    `        (queries, mutations, subscriptions) and receives a generated 'query.ts' in\n` +
    `        the same directory. All other .graphql files are expected to contain fragment\n` +
    `        definitions, which are made available to all operations across the codebase.\n` +
    `\n` +
    `--defs=DEFS_FILE  (alias: -d)\n` +
    `        Client only. The path to the shared definitions file, which will receive\n` +
    `        generated definitions for the 'IdOf', 'Query', 'QueryArgs' and 'QueryResult'\n` +
    `        types as well as enum, input and custom ID types.\n` +
    `\n` +
    `--help  (alias: -h)\n` +
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

  try {
    const schema = buildGraphqlSchema(schemaDir);

    switch (target) {
      case 'server': {
        const output = args.output as string | undefined;
        if (!output) {
          console.error('--output must be specified for --target=server');
          process.exitCode = 1;
          return;
        }

        const definitions = defineServerTypes(schema);
        fs.writeFileSync(output, definitions, {encoding: 'utf-8'});
        break;
      }
      case 'client': {
        const src = args.src as string | undefined;
        const defs = args.defs as string | undefined;
        if (!src || !defs) {
          console.error('Both --src and --defs must be specified for --target=client');
          process.exitCode = 1;
          return;
        }

        defineClientTypes(schema, path.resolve(defs), path.resolve(src));
        break;
      }
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
    return;
  }
};
main();
