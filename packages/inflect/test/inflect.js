/* eslint-disable */
const assert = require('assert');
const {inflectWord} = require('../dist');

describe('inflectWord', () => {
  const term = 'foo';
  const stems = new Map([
    ['stem1', 'bar'],
    ['stem2', 'quux'],
  ]);

  const unusedStems = {
    has(stem) { throw new Error(`Unexpected call to stems.has: ${stem}`); },
    get(stem) { throw new Error(`Unexpected call to stems.get: ${stem}`); },
  };

  it('should replace {~} with the term', () => {
    assert.equal(inflectWord('{~}', term, stems), term);
    assert.equal(inflectWord('beep{~}boop', term, stems), 'beepfooboop');
  });

  it('should replace stems with the corresponding value', () => {
    assert.equal(inflectWord('{stem1}', term, stems), 'bar');
    assert.equal(inflectWord('{stem2}~{stem1}', term, stems), 'quux~bar');
  });

  it('should use the term for missing stems', () => {
    assert.equal(inflectWord('{missingno}', term, stems), 'foo');
    assert.equal(inflectWord('{notdef}{stem1}', term, stems), 'foobar');
  });

  it('should escape braces', () => {
    assert.equal(inflectWord('{{', term, unusedStems), '{');
    assert.equal(inflectWord('}}', term, unusedStems), '}');
    assert.equal(inflectWord('{{{~}}}', term, stems), '{foo}');
  });

  it('should ignore a lone "}"', () => {
    assert.equal(inflectWord('}', term, unusedStems), '}');
    // The '{~}' placeholder gets parsed first, then it finds the '}'
    assert.equal(inflectWord('{~}}', term, stems), 'foo}');
    assert.equal(inflectWord('foo}bar', term, unusedStems), 'foo}bar');
  });

  it('should ignore invalid placeholders', () => {
    // '{}' should pass through unchanged
    assert.equal(inflectWord('{}', term, unusedStems), '{}');
    // '{}}' should become '{}', as the '{' passes through unchanged
    // and '}}' is an escaped brace.
    assert.equal(inflectWord('{}}', term, unusedStems), '{}');
    // A '{' without mate is also passed through.
    assert.equal(inflectWord('foo{bar', term, unusedStems), 'foo{bar');
  });

  it('should strip leading and trailing whitespace', () => {
    assert.equal(inflectWord('  {~}', term, stems), 'foo');
    assert.equal(inflectWord('{~}  ', term, stems), 'foo');
    assert.equal(inflectWord('  {~}  ', term, stems), 'foo');
  });
});
