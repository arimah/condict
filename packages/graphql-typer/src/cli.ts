#!/usr/bin/env node

import fs from 'fs';

import parseCliArgs, {OptionDefinition} from 'command-line-args';

import {buildGraphqlSchema, defineTypes} from '.';

const options: OptionDefinition[] = [
  {name: 'schema-dir', alias: 's', type: String},
  {name: 'target', alias: 't', type: String},
  {name: 'include-introspection-types', alias: 'i', type: Boolean},
];

const main = () => {
  const args = parseCliArgs(options);

  const schemaDir = args['schema-dir'] as string | undefined;
  const target = args['target'] as string | undefined;
  if (!schemaDir || !target) {
    console.error('Both --schema-dir/-s and --target/-t must be specified');
    process.exitCode = 1;
    return;
  }

  const includeIntrospectionTypes = !!args['include-introspection-types'];

  const schema = buildGraphqlSchema(schemaDir);
  const definitions = defineTypes(schema, includeIntrospectionTypes);
  fs.writeFileSync(target, definitions, {encoding: 'utf-8'});
};
main();
