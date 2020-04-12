> # CONDICT IS PAUSED
>
> **Please note:** Development of Condict is paused while I work out some technical decisions. In particular:
>
> - Are there any good, sufficiently customisable rich-text editors for the web? Many are either too locked into a particular format (almost everything other than [Slate][]), or have bizarre editing bugs (e.g. [Slate][]).
> - Is Electron the way forward? Performance is not great; memory is hogged; the UI looks and feels non-native.
> - If not Electron, then what? Can the NodeJS-based backend be kept, or is it necessary to rewrite that logic too?
> - SQLite is amazing, and is probably here to stay, but what about Unicode? [ICU][] is a nightmare to compile, and the [`better-sqlite3`][better-sqlite3] package is not easy to use with a custom amalgamation.
>
> To anyone reading this, **thoughts and comments are welcome!** Please don't hesitate to [create an issue](https://github.com/arimah/condict/issues/new) if you wish to offer feedback.

[slate]: https://www.slatejs.org/
[icu]: http://site.icu-project.org/home
[better-sqlite3]: https://github.com/JoshuaWise/better-sqlite3

# Condict

Condict is a piece of dictionary software primarily designed for [constructed languages][conlang]. Or at least, that's what this is intended to become. For the time being, it's very much a work-in-progress, with no functioning frontend.

Here are some of the features that are planned for Condict:

* [x] **Multiple languages** with interlinking – useful for world building!
* [x] **Inflection rules,** in the form of inflection tables, which you can associate with a part of speech, and attach to any word you add to the dictionary.
  - [x] Including the ability to add inflected words to the dictionary, so that _birds_ can be shown as "_plural of **bird**_".
* [ ] **Word etymology,** both free-form – e.g. "Misinterpretation of _acorn_ as _egg_ + _corn_" – and simple combinations of other words – "_snow_ + _man_".
  - [ ] Including showing derived terms under any dictionary word. Under _snow_, you'd be able to find _snowman_.
* [ ] **Search and filtering options,** naturally.
* [ ] **Sample texts,** with [interlinear glosses][interlinear], which get automatically linked to and shown under the words used therein.
* [x] **Tags,** mainly for thematic grouping, such as _food_, _colours_, _emotions_.
* And more in the future!

Special care has been taken to ensure Condict adheres as closely as possible to current best accessibility practices, to make the software usable by the widest possible audience.

The name _Condict_ is a [portmanteau][] of "conlang dictionary", while _conlang_ is itself a portmanteau of "constructed language". It's a metaportmanteau, if you will.

[conlang]: https://en.wikipedia.org/wiki/Constructed_language
[interlinear]: https://en.wikipedia.org/wiki/Interlinear_gloss
[portmanteau]: https://en.wikipedia.org/wiki/Portmanteau

## Code structure

The eventual goal of Condict is to be distributable as a standalone Electron app, as well as separate server and admin area components for websites. Condict is made up of many packages, which are found in [packages/](./packages).

* [a11y-utils](./packages/a11y-utils): Various small utility functions and React components for accessibility features.
* [dev-server](./packages/dev-server): A small wrapper around Webpack dev server, used by other packages for testing UI components.
* [gen-id](./packages/gen-id): A microscopic package which exports a single function that generates a random-enough ID string.
* [graphql-typer](./packages/graphql-typer): Generates TypeScript type definitions from a GraphQL schema.
* [ipa](./packages/ipa): Utilities for searching and listing [IPA][] characters.
* [ipa-input](./packages/ipa-input): A fancy textbox that searches [IPA][] characters.
* [platform](./packages/platform): Basic platform detection, with support for overrides.
* [server](./packages/server): The storage backend.
* [table-editor](./packages/table-editor): UI components for editing inflection tables. Separate package because of its size and complexity.
* [ui](./packages/ui): Mostly-general-purpose reusable UI components.
* [x-sampa](./packages/x-sampa): [X-SAMPA][xsampa]-to-[IPA][] converter.

TODO: documentation.

[ipa]: https://en.wikipedia.org/wiki/International_Phonetic_Alphabet
[xsampa]: https://en.wikipedia.org/wiki/X-SAMPA
