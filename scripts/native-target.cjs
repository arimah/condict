const fs = require('fs');
const path = require('path');

const TargetFile =  `${path.dirname(__dirname)}/.last-native-target`;

const command = process.argv[2];

const desiredTarget = (process.argv[3] || '').trim();
if (!desiredTarget) {
  // No target specified, treat that as a failure.
  console.error('native-target: missing target');
  process.exit(2);
}

switch (command) {
  case 'test': {
    let currentTarget;
    try {
      currentTarget = fs.readFileSync(TargetFile, {encoding: 'utf8'});
      currentTarget = currentTarget.trim();
    } catch (e) {
      // Missing file is not an error, just a target mismatch.
      if (e instanceof Error && e.code === 'ENOENT') {
        process.exit(1);
      }

      // Any other error is a failure.
      console.error('native-target: error reading .last-native-target:', e);
      process.exit(2);
    }

    if (currentTarget !== desiredTarget) {
      // Target mismatch, that's a failure.
      process.exit(1);
    }
    break;
  }
  case 'set':
    try {
      fs.writeFileSync(TargetFile, desiredTarget, {
        encoding: 'utf8',
      });
    } catch (e) {
      console.error('native-target: error writing .last-native-target:', e);
      process.exit(2);
    }
    break;
  default:
    console.error('native-target: unknown command:', command);
    process.exit(2);
}

// If we get this far, everything is okay.
process.exit(0);
