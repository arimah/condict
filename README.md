<div align="center">
  <p>
    <img src="https://raw.githubusercontent.com/arimah/condict/master/docs/logo-full.png" alt="Condict symbol and logo">
    <br>
    dictionary application for conlangers
  </p>

  <h1>Condict</h1>
</div>

**Condict is a _work-in-progress_ dictionary application** for [constructed languages][conlang] that runs on your desktop. If you've ever found yourself struggling to keep track of a dozen spreadsheets and random documents with conlang words, then Condict may be for you. Some of Condict's guiding principles:

* **Fully offline:** Condict runs on your computer and saves your dictionary locally. There is no web service to connect to. Your data is yours, forever. (However, you can deploy a standalone Condict server on your own web server. More to come in the future.)
* **Free and open source:** Condict costs nothing and hides nothing. All code is open source and free to use as you see fit. Modify it to your heart's content. No ads, no microtransactions, no DLC.
* **No tracking, no telemetry:** Condict will never track your activities or usage. What you do with your dictionary, how often and in what way is *entirely* up to you.
* **Built for accessibility:** Do you prefer to keep your hands on the keyboard? Do you require dark mode and muted colours? Do you use a screen reader? With customisable appearance, keyboard shortcuts and more, Condict aims to accommodate all users. _You will even be able to translate the app to your own conlang._ (Screen reader compatibility is currently imperfect and will be improved over time.)
* **Performant:** Yes, Condict is an Electron app. With a bit of careful programming, it still feels fairly snappy even on slowish devices.

[conlang]: https://en.wikipedia.org/wiki/Constructed_language

## Dictionary feature summary

Here are some of the things you can (or will be able to) do with your dictionary:

* [x] **Multiple languages** with interlinking – useful for world building!
* [x] **Inflection rules,** in the form of inflection tables, which you can associate with a part of speech, and attach to any word you add to the dictionary.
  - [x] Including the ability to add inflected words to the dictionary, so that _birds_ can be shown as "_plural of **bird**_".
* [ ] **Word etymology,** both free-form – e.g. "Misinterpretation of _acorn_ as _egg_ + _corn_" – and simple combinations of other words – "_snow_ + _man_".
  - [ ] Including showing derived terms under any dictionary word. Under _snow_, you'd be able to find _snowman_.
* [x] **Search and filtering options,** naturally.
* [ ] **Sample texts,** with [interlinear glosses][interlinear], which get automatically linked to and shown under the words used therein.
* [x] **Tags,** mainly for thematic grouping, such as _food_, _colours_, _emotions_.
* And more!

[interlinear]: https://en.wikipedia.org/wiki/Interlinear_gloss

## Logo and name

<img align="right" src="https://raw.githubusercontent.com/arimah/condict/master/docs/logo-symbol.png" alt="Condict symbol, a deconstructed letter C">

The Condict symbol is intended to convey the concept of construction: from many parts, a C is formed – a letter, the foundation of writing and an expression of language. Alternatively, one could conceive of it as the deconstruction of language into its constituent components. Each part of the character might also stand in for the bricks comprising the Tower of Babel, the translation of which myth is a long-standing practice among conlangers. The colour purple was chosen for its associations with creativity and magic.

The wordmark is written in the typeface [Noto Sans][noto], a project whose lofty aim is to support every writing system.

The name _Condict_ is a [portmanteau][] of "conlang dictionary", while _conlang_ is itself a portmanteau of "constructed language". It's a metaportmanteau, if you will.

[noto]: https://fonts.google.com/noto
[portmanteau]: https://en.wikipedia.org/wiki/Portmanteau

## Development status

**Development is slow.** This is one of several projects I engage in outside my full-time job. As a result, I am unable to devote significant time to Condict most days. This project is also still fairly immature as far as tooling and structure are concerned, and much remains to be improved. Ideas and thoughts are welcome.

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

1. First time or after using the app, rebuild native dependencies: `cd packages/server && npm run build:native && cd ../..`
2. `npm run dev:server`
3. In a different terminal: `cd packages/http-server`
4. First time only: `cp config.json.example config.json`
5. Please edit `config.json` file if you wish to customize logging and the database location.
6. `npm start`

If the server fails to start with errors around [better-sqlite3][] or [bcrypt][], you may need to run `npm run build:native-deps` in `packages/server`.

When the server is running, a GraphQL sandbox will be accessible at `http://localhost:4000`. If you have set a different port in the config, connect to that port instead of 4000. **The server does _not_ automatically reload on recompilation;** you must restart it manually.

**Important:** The GraphQL sandbox is _not_ served locally. It's an embedded version of Apollo Sandbox. You must be connected to the internet to use it. If you do not wish to use it, you can query the server from any GraphQL client of your choice.

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
* [http-server](./packages/http-server): A standalone HTTP server that exposes Condict's GraphQL schema, designed for use *outside* the app.
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
