# Condict

Condict is a dictionary application primarily designed for [constructed languages][conlang]. Or at least, that's what this is intended to become. For the time being, it's very much a work-in-progress, with a barely functioning frontend.

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
* [x] **Search and filtering options,** naturally.
* [ ] **Sample texts,** with [interlinear glosses][interlinear], which get automatically linked to and shown under the words used therein.
* [x] **Tags,** mainly for thematic grouping, such as _food_, _colours_, _emotions_.
* And more in the future!

[conlang]: https://en.wikipedia.org/wiki/Constructed_language
[interlinear]: https://en.wikipedia.org/wiki/Interlinear_gloss
[portmanteau]: https://en.wikipedia.org/wiki/Portmanteau

## Contributing

Condict is still a little bit too early in development for feature contributions. There is no public roadmap to contribute to, and the project structure as a whole is still in a state of flux. In addition, Condict was originally written in JS, then later translated to TypeScript, and is still suffering the effects. Some of the code from the pre-TS days is downright messy, and requires severe rearchitecting.

If you'd like to keep up to date with developments, feel free to watch this repo.

That said, **bug reports and bug fix PRs are welcome**, even at this stage.

## Getting started

Getting Condict up and running is a slightly involved process. Keep in mind **Condict is a work in progress, and many features are missing**, including documentation.

First, run initial setup: `npm run setup`

### Testing/developing UI components

1. `npm run dev:ui`
2. Navigate to `http://localhost:3000`.

Source files for the UI component test server are in [dev/](./dev).

### Testing/developing the server

1. `npm run dev:server`
2. In a different terminal, `cd packages/server`
3. First time only: `cp config.json.example config.json`
4. Please edit `config.json` file if you wish to customize logging and the database location.
5. First time after using the app, rebuild native dependencies: `npm run build:native`
6. `npm start`

If the server fails to start with errors around [better-sqlite3][] or [bcrypt][], you may also need to run `npm run build:native-deps`.

When the server is running, a GraphQL playground will be accessible at `http://localhost:4000`. **The server does _not_ automatically reload on recompilation;** you must restart it manually.

### Testing/developing the app

The app depends on the server. The server has dependencies on a few native modules, and contains its own native module too. While the server targets Node, the app is written for Electron. The practical effect of this: you must rebuild native modules for the app, and you cannot run the app and the server simultaneously in the same repository.

1. `npm run dev:app`
2. In a different terminal, `cd packages/app`
3. First time or after using the server: `npm run build:native`
4. `npm start`

Now you should have a Condict window. Have fun!

[lerna]: https://lerna.js.org/
[styled-components]: https://styled-components.com/
[better-sqlite3]: https://www.npmjs.com/package/better-sqlite3
[bcrypt]: https://www.npmjs.com/package/bcrypt

## Code structure

The eventual goal of Condict is to be distributable as a standalone Electron app, as well as a separate server package for shared dictionary use (e.g. on your own website). Condict is made up of many packages, which are found in [packages/](./packages).

* [app](./packages/app): The main Condict frontend (the Electron app).
* [graphql-typer](./packages/graphql-typer): Generates TypeScript type definitions from a GraphQL schema.
* [ipa](./packages/ipa): Utilities for searching and listing [IPA][] characters.
* [platform](./packages/platform): Basic platform detection, with support for overrides.
* [rich-text-editor](./packages/rich-text-editor): The rich text editor component for definition descriptions and inflection table captions.
* [server](./packages/server): The storage backend.
* [table-editor](./packages/table-editor): UI components for editing inflection tables. Separate package because of its size and complexity.
* [ui](./packages/ui): Mostly-general-purpose reusable UI components.
* [x-sampa](./packages/x-sampa): [X-SAMPA][xsampa]-to-[IPA][] converter.

TODO: documentation.

[ipa]: https://en.wikipedia.org/wiki/International_Phonetic_Alphabet
[xsampa]: https://en.wikipedia.org/wiki/X-SAMPA
