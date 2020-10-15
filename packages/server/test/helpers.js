const assert = require('assert');

const {CondictServer, createLogger, executeLocalOperation} = require('../dist');

const {AssertionError} = assert;

const Optional = Symbol();

const isArray = Array.isArray;

const isPlainObject = value => {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  if (Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const isOptional = expected => expected != null && expected[Optional];

const hasOwn = Object.prototype.hasOwnProperty;

const describeType = value => {
  const type = typeof value;
  switch (type) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'bigint':
    case 'string':
    case 'symbol':
    case 'function':
      return type;
    case 'object':
      if (value === null) {
        return 'null';
      }
      if (isArray(value)) {
        return 'array';
      }
      return 'object';
    default:
      throw new Error(`unreachable: ${type}`);
  }
};

const formatPath = path => {
  if (path.length === 0) {
    return 'value';
  }

  const pathText = path
    .map((name, index) => {
      if (typeof name === 'number') {
        return `[${name}]`;
      }
      return index > 0 ? `.${name}` : name;
    })
    .join('');
  return `\`${pathText}\``;
}

const compareResult = (expected, actual, path, captures) => {
  switch (typeof expected) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'bigint':
    case 'string':
    case 'symbol':
      assert.strictEqual(actual, expected);
      break;
    case 'function':
      expected(actual, path, captures);
      break;
    case 'object':
      if (expected === null) {
        assert.strictEqual(actual, expected);
      } else if (isArray(expected)) {
        compareArrays(expected, actual, path, captures);
      } else {
        compareObjects(expected, actual, path, captures);
      }
      break;
    default:
      throw new Error('unreachable');
  }
};

const compareArrays = (expected, actual, path, captures) => {
  if (!isArray(actual)) {
    throw new AssertionError({
      message: `Expected ${formatPath(path)} to be an array, got ${
        describeType(actual)
      }`,
      actual,
    });
  }
  if (actual.length !== expected.length) {
    throw new AssertionError({
      message: `Expected ${
        formatPath(path)
      } to be an array of length ${expected.length}, got ${actual.length}`,
      actual,
    });
  }

  for (let i = 0; i < expected.length; i++) {
    compareResult(expected[i], actual[i], path.concat(i), captures);
  }
};

const compareObjects = (
  expected,
  actual,
  path,
  captures,
  allowExtraProps = false
) => {
  if (!isPlainObject(actual)) {
    throw new AssertionError({
      message: `Expected ${formatPath(path)} to be an object, got ${
        describeType(actual)
      }`,
      actual,
    });
  }

  const seenKeys = new Set();
  for (const key of Object.keys(expected)) {
    if (!hasOwn.call(actual, key)) {
      if (isOptional(expected[key])) {
        // Optional and missing - perform no further checking.
        continue;
      }

      // Required and missing - that's an error.
      throw new AssertionError({
        messages: `Expected ${formatPath(path)} to contain the key \`${key}\``,
        actual,
      });
    }
    compareResult(expected[key], actual[key], path.concat(key), captures);
    seenKeys.add(key);
  }

  if (!allowExtraProps) {
    const extraKeys = Object.keys(actual).filter(k => !seenKeys.has(k));
    if (extraKeys.length > 0) {
      throw new AssertionError({
        message: `Unexpected extra keys in ${formatPath(path)}: ${
          extraKeys.join(', ')
        }`,
        actual,
      });
    }
  }
};

const assertOperationResult = async (
  server,
  operation,
  variableValues,
  expected
) => {
  const actual = await executeLocalOperation(server, operation, variableValues);
  const captures = Object.create(null);
  compareResult(expected, actual, [], captures);
  return captures;
};

const capture = name => (value, path, captures) => {
  if (hasOwn.call(captures, name)) {
    throw new Error(`${formatPath(path)}: name captured multiple times: ${name}`);
  }
  captures[name] = value;
};

const optional = expected => Object.assign(
  (actual, path, captures) => compareResult(expected, actual, path, captures),
  {[Optional]: true}
);

const allowExtraProps = expected => (actual, path, captures) => {
  compareObjects(expected, actual, path, captures, true);
};

const nullLogger = createLogger({stdout: false, files: []});

const startServer = async () => {
  const server = new CondictServer(nullLogger, {
    database: {file: ':memory:'},
  });
  await server.start();
  return server;
};

exports.assertOperationResult = assertOperationResult;
exports.capture = capture;
exports.optional = optional;
exports.allowExtraProps = allowExtraProps;
exports.startServer = startServer;
