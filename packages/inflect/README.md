# @condict/inflect

This package provides APIs for handling Condict inflection pattern. As the name may suggest, an _inflection pattern_ describes how to inflect a word. The inflection pattern contains any number of placeholders inside curly bracketes, like `{Plural root}`, which are replaced by the word's correspondingly named stems. The special placeholder `{~}` always refers to a word's lemma form.

As an example, the general pattern for forming English plurals is `{~}s` – that is, append an _s_ to the word. Some words follow the pattern `{~}es`. The plural of Arabic _kitāb_ "book" could be expressed as `{C1}u{C2}u{C3}`: when given the stems C1 = k, C2 = t, C3 = b (the three consonants of the root), the inflected form becomes _kutub_.

## Examples

Word inflection:

```javascript
import {inflectWord} from '@condict/inflect';

// lizard -> lizards
const pattern1 = '{~}s';
const term1 = 'lizard';
const stems1 = new Map();
console.log(inflectWord(pattern1, term1, stems1)); // lizards

// kitāb -> kutub
const pattern2 = '{C1}u{C2}u{C3}';
const term2 = 'kitāb';
const stems3 = new Map([
  ['C1', 'k'],
  ['C2', 't'],
  ['C3', 'b'],
]);
console.log(inflectWord(pattern2, term2, stems2)); // kutub
```

Normalization:

```javascript
import {normalizePattern} from '@condict/inflect';

const pattern = '{ Root }en{Plural suffix } ';
const normalPattern = normalizePattern(pattern);
console.log(normalPattern); // {Root}en{Plural suffix}
```

## `inflectWord()`

> `inflectWord(pattern: string, term: string, stems: StemMap): string`

Inflects a word according to the specified pattern. The `term` is used to replace `{~}` placeholders as well as any named stem placeholder that doesn't have an entry in `stems`.

**Note:** This function _assumes_ that the pattern has been normalized. Stem names are looked up with exactly the values that are present in the pattern. If you don't know whether the pattern is normalized, call [`normalizePattern()`](#normalizepattern) on it first.

### `StemMap`

A `StemMap` is any map-like type with string keys and values. It is used to look up a word's stems.

## `normalizePattern()`

> `normalizePattern(pattern: string): string`

Normalizes an inflection pattern.

Patterns are normalized by trimming away white space at the start and end, and by normalizing each stem name inside the pattern (for details, see [`normalizeStem()`](#normalizestem)).

## `normalizeStem()`

> `normalizeStem(stem: string): string`

Normalizes the specified stem name.

Stems are normalized by trimming away white space at the start and end, and by collapsing sequences of internal white space to single spaces (U+0020).

## `tokenizePattern()`

> `tokenizePattern(pattern: string): Token[]`

Tokenizes the specified pattern.

This classifies the components of a pattern according to their kind. There are three kinds of components:

* Placeholders – `{~}`, `{Verb root}`, etc.
* Escaped braces – `{{` and `}}`, which are turned into the characters "{" and "}", respectively.
* Plain text, which is not treated specially in any way.

This can be used for highlighting parts of an inflection pattern in a UI.
