/* eslint-disable */
const assert = require('assert');
const {tokenizePattern} = require('../dist');

const text = value => ({kind: 'text', value});
const placeholder = (value, stem) => ({kind: 'placeholder', value, stem});
const brace = value => ({kind: 'brace', value});

describe('tokenizePattern', () => {
  it('should handle text tokens', () => {
    assert.deepEqual(
      Array.from(tokenizePattern('hello')),
      [
        text('hello'),
      ]
    );

    // The empty string contains no tokens
    assert.deepEqual(
      Array.from(tokenizePattern('')),
      []
    );
  });

  it('should handle placeholder tokens', () => {
    assert.deepEqual(
      Array.from(tokenizePattern('{hello}')),
      [
        placeholder('{hello}', 'hello'),
      ]
    );
  });

  it('should handle escaped braces', () => {
    assert.deepEqual(
      Array.from(tokenizePattern('{{')),
      [
        brace('{{'),
      ]
    );

    assert.deepEqual(
      Array.from(tokenizePattern('}}')),
      [
        brace('}}'),
      ]
    );
  });

  it('should treat lone "}" as text', () => {
    assert.deepEqual(
      Array.from(tokenizePattern('foo}bar')),
      [
        text('foo}bar'),
      ]
    );

    assert.deepEqual(
      Array.from(tokenizePattern('foo}}}bar')),
      [
        text('foo'),
        brace('}}'),
        text('}bar'),
      ]
    );
  });

  it('should treat unmatched "{" as text', () => {
    assert.deepEqual(
      Array.from(tokenizePattern('foo{bar')),
      [
        text('foo{bar'),
      ]
    );
  });

  it('should treat "{}" as text', () => {
    assert.deepEqual(
      Array.from(tokenizePattern('foo{}bar')),
      [
        text('foo{}bar'),
      ]
    );
  });

  it('should handle complex patterns', () => {
    assert.deepEqual(
      Array.from(tokenizePattern('prefix{~}suffix')),
      [
        text('prefix'),
        placeholder('{~}', '~'),
        text('suffix'),
      ]
    );

    assert.deepEqual(
      Array.from(tokenizePattern('{stem}foo{{bar baz}{beep}')),
      [
        placeholder('{stem}', 'stem'),
        text('foo'),
        brace('{{'),
        text('bar baz}'),
        placeholder('{beep}', 'beep'),
      ]
    );

    assert.deepEqual(
      Array.from(tokenizePattern('{{{foo}bar{{{baz}}}x}')),
      [
        brace('{{'),
        placeholder('{foo}', 'foo'),
        text('bar'),
        brace('{{'),
        placeholder('{baz}', 'baz'),
        brace('}}'),
        text('x}'),
      ]
    );
  });
});
