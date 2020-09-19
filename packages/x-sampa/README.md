# @condict/x-sampa

The [X-SAMPA][xsampa] is a method of encoding phonetic transcriptions, designed to be compatible with the [IPA][]. This package provides a function that converts most X-SAMPA text to IPA. In general, the conversion function in this package aims to be _ergonomic_ and to do (probably) the right thing most of the time, rather than to be a completely compliant solution.

There are several noteworthy differences between standard X-SAMPA and what this package implements. Some extensions from the [Conlang X-SAMPA (CXS)][cxs] variant have been incorporated. Additionally, some special cases exist for ergonomic reasons. The following are changes from standard X-SAMPA:

* Both `1` and `i\` represent \[ɨ\].
* Both `}` and `u\` represent \[ʉ\].
* But note: CXS `&` is encoded by standard X-SAMPA `{` \[æ\]; `&` represents \[ɶ\], as in standard X-SAMPA, not \[æ\] as in CXS; and `&\` \[ɶ\] from CXS is absent.
* Both `'` and `"` represent \[ˈ\] (primary stress).
* Both `,` and `%` represent \[ˌ\] (secondary stress). However, `,` is not converted at the end of a line or before a space, to make situations like `wVn, tu:, Tr\i:` require fewer escapes (the comma would otherwise have to be written `*,`).
* Palatalisation \[ʲ\] is expressed through `_j` and `;`. The standard X-SAMPA `'` is used for primary stress instead.
* The Condict-specific characters `_T\`, `_H\`, `_M\`, `_L\` and `_B\` unambiguously represent the tone characters \[˥ ˦ ˧ ˨ ˩\]. They never become accents.

The following features are _not_ implemented:

* The tie bar, expressed in X-SAMPA with an underscore (`k_p` \[k͡p\], `t_s` \[t͡s\]), because it is ambiguous in some circumstances (underscore usually introduces a diacritic or modifier).
* The CXS tie bar, written as a right parenthesis after the pair (`kp)` \[k͡p\], `ts)` \[t͡s\]), is not _yet_ implemented.
* Non-segmental notation, written between pairs of angle brackets (`<...>`).
* The X-SAMPA character `/`, which Wikipedia describes as "indeterminacy in French vowels", because it has no IPA equivalent.
* The generic separator `-`, because it has no IPA equivalent.
* The language-specific tone diacritics `_1` to `_6`, since they are language-specific.

The asterisk, `*`, _is_ implemented as an escape character. Any character after it is preserved literally, and the asterisk is removed: `*Bir*D` becomes _BirD_. Note that the asterisk only escapes the one character following it: in `A*_B`, we only escape the `_`, not the entire `_B` sequence, resulting in _ɑ\_β_.

## Example

```js
import xsampaToIpa from '@condict/x-sampa';

console.log(xsampaToIpa(`,foUn@'tIS@n`)); // ˌfoʊnəˈtɪʃən
console.log(xsampaToIpa('r\\I.{kt')); // ɹɪ.ækt
```

## API

The default export is a function with this signature:

> convert(xsampa: string): string

It takes the X-SAMPA string as input, and returns the corresponding IPA text.

[ipa]: https://en.wikipedia.org/wiki/International_Phonetic_Alphabet
[xsampa]: https://en.wikipedia.org/wiki/X-SAMPA
[cxs]: http://www.theiling.de/ipa/
