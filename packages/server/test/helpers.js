const assert = require('assert');
const util = require('util');

const {GraphQLError} = require('graphql');

const {CondictServer, createLogger, executeLocalOperation} = require('../dist');

const {AssertionError} = assert;

const Optional = Symbol();
const ObjectMatcher = Symbol();

const isArray = Array.isArray;

const isSameObjectKind = (expected, actual) => {
  if (actual == null || typeof actual !== 'object') {
    return false;
  }

  const expectedProto = Object.getPrototypeOf(expected);
  const actualProto = Object.getPrototypeOf(actual);

  // If expected has null or Object as its prototype, allow actual to have
  // either null or Object. That way, "plain object" values can be compared
  // as equal whether they have the Object prototype or not.
  if (expectedProto === null || expectedProto === Object.prototype) {
    return actualProto === null || actualProto === Object.prototype;
  }

  // In other cases, the two prototypes must match.
  return expectedProto === actualProto;
};

const isOptional = expected => expected != null && expected[Optional];

const isObjectMatcher = expected => expected != null && expected[ObjectMatcher];

const hasOwn = Object.prototype.hasOwnProperty;

const inspect = value => util.inspect(value, {
  // util.inspect may have its defaults overridden; these options match what
  // NodeJS's assert module uses internally.
  compact: false,
  customInspect: false,
  depth: 1000,
  maxArrayLength: Infinity,
  showHidden: false,
  showProxy: false,
  sorted: true,
  getters: true,
});

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
    case 'object': {
      if (value === null) {
        return 'null';
      }
      if (isArray(value)) {
        return 'array';
      }
      const proto = Object.getPrototypeOf(value);
      if (proto === null || proto === Object.prototype) {
        return 'object';
      }
      if (
        hasOwn.call(proto, Symbol.toStringTag) &&
        // 'Object' is the default for some transpiled ES classes.
        proto[Symbol.toStringTag] !== 'Object'
      ) {
        return proto[Symbol.toStringTag];
      }
      return (
        proto.constructor.name ||
        proto.name ||
        Object.prototype.toString.call(value)
      );
    }
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

const assertResultMatches = (expected, actual, path, captures) => {
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
        assertIsArray(actual, path);
        assertArraysMatch(expected, actual, path, captures);
      } else {
        assertSameObjectKind(expected, actual, path);
        assertPropsMatch(expected, actual, path, captures);
        assertNoExtraProps(expected, actual, path);
      }
      break;
    default:
      throw new Error('unreachable');
  }
};

const assertIsArray = (actual, path) => {
  if (!isArray(actual)) {
    assert.fail(
      `Expected ${formatPath(path)} to be an array, got ${
        describeType(actual)
      }\n\n${inspect(actual)}`
    );
  }
};

const assertArraysMatch = (expected, actual, path, captures) => {
  if (actual.length !== expected.length) {
    assert.fail(
      `Expected ${
        formatPath(path)
      } to be an array of length ${expected.length}, got ${actual.length}\n\n${
        inspect(actual)
      }`
    );
  }

  for (let i = 0; i < expected.length; i++) {
    assertResultMatches(expected[i], actual[i], path.concat(i), captures);
  }
};

const assertSameObjectKind = (expected, actual, path) => {
  if (!isSameObjectKind(expected, actual)) {
    assert.fail(
      `Expected ${formatPath(path)} to be ${
        describeType(expected)
      }, got ${
        describeType(actual)
      }\n\n${inspect(actual)}`
    );
  }
};

const assertInstanceOf = (expectedType, actual, path) => {
  if (!(actual instanceof expectedType)) {
    assert.fail(
      `Expected ${formatPath(path)} to be an instance of ${
        expectedType.name
      }, got ${
        describeType(actual)
      }\n\n${inspect(actual)}`
    );
  }
};

const assertPropsMatch = (expected, actual, path, captures) => {
  for (const key of Object.keys(expected)) {
    if (!hasOwn.call(actual, key)) {
      if (isOptional(expected[key])) {
        // Optional and missing - perform no further checking.
        continue;
      }

      // Required and missing - that's an error.
      assert.fail(
        `Expected ${formatPath(path)} to contain the key \`${key}\`\n\n${
          inspect(actual)
        }`
      );
    }
    assertResultMatches(expected[key], actual[key], path.concat(key), captures);
  }
};

const assertNoExtraProps = (expected, actual, path) => {
  const extraKeys = Object.keys(actual).filter(k => !hasOwn.call(expected, k));
  if (extraKeys.length > 0) {
    assert.fail(
      `Unexpected extra keys in ${formatPath(path)}: ${
        extraKeys.join(', ')
      }\n\n${inspect(actual)}`
    );
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
  assertResultMatches(expected, actual, [], captures);
  return captures;
};

const capture = name => (value, path, captures) => {
  if (hasOwn.call(captures, name)) {
    throw new Error(`${formatPath(path)}: name captured multiple times: ${name}`);
  }
  captures[name] = value;
};

const optional = expected => Object.assign(
  (actual, path, captures) => assertResultMatches(expected, actual, path, captures),
  {[Optional]: true}
);

const createObjectMatcher = (expected, matcherProps) => {
  let matcher;
  if (isObjectMatcher(expected)) {
    matcher = expected;
  } else {
    matcher = (actual, path, captures) => {
      if (matcher.instanceOf) {
        assertInstanceOf(matcher.instanceOf, actual, path);
      } else {
        assertSameObjectKind(expected, actual, path);
      }

      assertPropsMatch(expected, actual, path, captures);

      if (!matcher.allowExtraProps) {
        assertNoExtraProps(expected, actual, path);
      }
    };
    matcher[ObjectMatcher] = true;
  }
  Object.assign(matcher, matcherProps);
  return matcher;
};

const instanceOf = (expectedType, expectedProps) =>
  createObjectMatcher(expectedProps, {instanceOf: expectedType,});

const allowExtraProps = expected =>
  createObjectMatcher(expected, {allowExtraProps: true});

const inputError = (message, path, args, extensions = null) =>
  allowExtraProps(instanceOf(GraphQLError, {
    message,
    path: typeof path === 'string' ? [path] : path,
    extensions: {
      code: 'BAD_USER_INPUT',
      invalidArgs: typeof args === 'string' ? [args] : args,
      ...extensions,
    },
  }));

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
exports.instanceOf = instanceOf;
exports.allowExtraProps = allowExtraProps;
exports.inputError = inputError;
exports.startServer = startServer;
