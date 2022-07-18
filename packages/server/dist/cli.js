#!/usr/bin/env node

// THIS IS A PLACEHOLDER FILE to ensure the package can be bootstrapped
// properly on Windows before building. Otherwise npm will run the script
// in Windows Script Host.
//
// This file is replaced when the package is built.
console.error(
  'condict-server must be built before it can be used\n' +
  'in the repo root, run `npm run build`'
);
process.exitCode = 1;
