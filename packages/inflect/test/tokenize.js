/* eslint-disable */
const assert = require('assert');
const {tokenizePattern} = require('../dist');

const text = value => ({kind: 'text', value});
const placeholder = (value, stem) => ({kind: 'placeholder', value, stem});
const brace = value => ({kind: 'brace', value});

describe('tokenizePattern', () => {
  it('should handle text tokens', () => {
    assert.deepEqual(
      tokenizePattern('hello'),
      [
        text('hello'),
      ]
    );

    // The empty string contains no tokens
    assert.deepEqual(
      tokenizePattern(''),
      []
    );
  });

  it('should handle placeholder tokens', () => {
    assert.deepEqual(
      tokenizePattern('{hello}'),
      [
        placeholder('{hello}', 'hello'),
      ]
    );
  });

  it('should handle escaped braces', () => {
    assert.deepEqual(
      tokenizePattern('{{'),
      [
        brace('{{'),
      ]
    );

    assert.deepEqual(
      tokenizePattern('}}'),
      [
        brace('}}'),
      ]
    );
  });

  it('should treat lone "}" as text', () => {
    assert.deepEqual(
      tokenizePattern('foo}bar'),
      [
        text('foo}bar'),
      ]
    );

    assert.deepEqual(
      tokenizePattern('foo}}}bar'),
      [
        text('foo'),
        brace('}}'),
        text('}bar'),
      ]
    );
  });

  it('should treat unmatched "{" as text', () => {
    assert.deepEqual(
      tokenizePattern('foo{bar'),
      [
        text('foo{bar'),
      ]
    );
  });

  it('should treat "{}" as text', () => {
    assert.deepEqual(
      tokenizePattern('foo{}bar'),
      [
        text('foo{}bar'),
      ]
    );
  });

  it('should handle complex patterns', () => {
    assert.deepEqual(
      tokenizePattern('prefix{~}suffix'),
      [
        text('prefix'),
        placeholder('{~}', '~'),
        text('suffix'),
      ]
    );

    assert.deepEqual(
      tokenizePattern('{stem}foo{{bar baz}{beep}'),
      [
        placeholder('{stem}', 'stem'),
        text('foo'),
        brace('{{'),
        text('bar baz}'),
        placeholder('{beep}', 'beep'),
      ]
    );

    assert.deepEqual(
      tokenizePattern('{{{foo}bar{{{baz}}}x}'),
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
