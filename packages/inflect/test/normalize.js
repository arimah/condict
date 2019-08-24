/* eslint-disable */
const assert = require('assert');
const {normalizeStem, normalizePattern} = require('../dist');

describe('normalizeStem', () => {
  it('should trim leading whitespace', () => {
    assert.equal(normalizeStem('  foo'), 'foo');
    assert.equal(normalizeStem('\tbar'), 'bar');
  });

  it('should trim trailing whitespace', () => {
    assert.equal(normalizeStem('foo  '), 'foo');
    assert.equal(normalizeStem('bar\t'), 'bar');
  });

  it('should collapse internal whitespace', () => {
    assert.equal(normalizeStem('foo  bar'), 'foo bar');
    assert.equal(normalizeStem('foo\tbar'), 'foo bar');
  });
});

describe('normalizePattern', () => {
  it('should trim leading whitespace', () => {
    assert.equal(normalizePattern('  foo{beep}'), 'foo{beep}');
    assert.equal(normalizePattern('\tbar{beep}'), 'bar{beep}');
  });

  it('should trim trailing whitespace', () => {
    assert.equal(normalizePattern('foo{boop}  '), 'foo{boop}');
    assert.equal(normalizePattern('bar{boop}\t'), 'bar{boop}');
  });

  it('should NOT collapse internal whitespace', () => {
    assert.equal(normalizePattern('foo  bar'), 'foo  bar');
    assert.equal(normalizePattern('foo\tbar'), 'foo\tbar');
  });

  it('should normalize stems', () => {
    assert.equal(normalizePattern('foo{ beep }bar'), 'foo{beep}bar');
    assert.equal(normalizePattern('foo{beep  boop}bar'), 'foo{beep boop}bar');
  });
});
