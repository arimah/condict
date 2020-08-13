# Condict

Condict is a piece of dictionary software primarily designed for [constructed languages][conlang]. Or at least, that's what this is intended to become. For the time being, it's very much a work-in-progress, with no functioning frontend.

Special care has been taken to ensure Condict adheres as closely as possible to current best accessibility practices, to make the software usable by the widest possible audience.

The name _Condict_ is a [portmanteau][] of "conlang dictionary", while _conlang_ is itself a portmanteau of "constructed language". It's a metaportmanteau, if you will.

## Development status

**Development is slow.** This is one of several projects I engage in outside my full-time job. As a result, I am unable to devote significant time to Condict most days. This project is also still fairly immature as far as tooling and structure are concerned, and much remains to be improved. Ideas and thoughts are welcome.

In lieu of a proper timeline or to-do list, here are some of the features that are planned for Condict:

* [x] **Multiple languages** with interlinking – useful for world building!
* [x] **Inflection rules,** in the form of inflection tables, which you can associate with a part of speech, and attach to any word you add to the dictionary.
  - [x] Including the ability to add inflected words to the dictionary, so that _birds_ can be shown as "_plural of **bird**_".
* [ ] **Word etymology,** both free-form – e.g. "Misinterpretation of _acorn_ as _egg_ + _corn_" – and simple combinations of other words – "_snow_ + _man_".
  - [ ] Including showing derived terms under any dictionary word. Under _snow_, you'd be able to find _snowman_.
* [ ] **Search and filtering options,** naturally.
* [ ] **Sample texts,** with [interlinear glosses][interlinear], which get automatically linked to and shown under the words used therein.
* [x] **Tags,** mainly for thematic grouping, such as _food_, _colours_, _emotions_.
* And more in the future!

[conlang]: https://en.wikipedia.org/wiki/Constructed_language
[interlinear]: https://en.wikipedia.org/wiki/Interlinear_gloss
[portmanteau]: https://en.wikipedia.org/wiki/Portmanteau

## Code structure

The eventual goal of Condict is to be distributable as a standalone Electron app, as well as separate server and admin area components for websites. Condict is made up of many packages, which are found in [packages/](./packages).

* [a11y-utils](./packages/a11y-utils): Various small utility functions and React components for accessibility features.
* [dev-server](./packages/dev-server): A small wrapper around Webpack dev server, used by other packages for testing UI components.
* [eslint-plugin](./packages/eslint-plugin): ESLint configuration.
* [graphql-typer](./packages/graphql-typer): Generates TypeScript type definitions from a GraphQL schema.
* [ipa](./packages/ipa): Utilities for searching and listing [IPA][] characters.
* [ipa-input](./packages/ipa-input): A fancy textbox that searches [IPA][] characters.
* [platform](./packages/platform): Basic platform detection, with support for overrides.
* [rich-text-editor](./packages/rich-text-editor): The rich text editor component for definition descriptions and inflection table captions.
* [server](./packages/server): The storage backend.
* [table-editor](./packages/table-editor): UI components for editing inflection tables. Separate package because of its size and complexity.
* [ui](./packages/ui): Mostly-general-purpose reusable UI components.
* [x-sampa](./packages/x-sampa): [X-SAMPA][xsampa]-to-[IPA][] converter.

TODO: documentation.

[ipa]: https://en.wikipedia.org/wiki/International_Phonetic_Alphabet
[xsampa]: https://en.wikipedia.org/wiki/X-SAMPA
