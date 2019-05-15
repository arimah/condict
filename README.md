# Condict

Condict is a piece of dictionary software primarily designed for [constructed languages][conlang]. Or at least, that's what this is intended to become. For the time being, it's very much a work-in-progress, with no functioning frontend.

Here are some of the features that are planned for Condict (some of which are already implemented):

* **Multiple languages** with interlinking – useful for world building!
* **Inflection rules,** in the form of inflection tables, which you can associate with a part of speech, and attach to any word you add to the dictionary.
  - Including the ability to add inflected words to the dictionary, so that _birds_ can be shown as "_plural of **bird**_".
* **Word etymology,** both free-form – e.g. "Misinterpretation of _acorn_ as _egg_ + _corn_" – and simple combinations of other words – "_snow_ + _man_".
  - Including showing derived terms under any dictionary word. Under _snow_, you'd be able to find _snowman_.
* **Search and filtering options,** naturally.
* **Sample texts,** with [interlinear glosses][interlinear], which get automatically linked to and shown under the words used therein.
* **Tags,** mainly for thematic grouping, such as _food_, _colours_, _emotions_.
* And more in the future!

Special care has been taken to ensure Condict adheres as closely as possible to current best accessibility practices, to make the software usable by the widest possible audience.

The name _Condict_ is a [portmanteau][] of "conlang dictionary", while _conlang_ is itself a portmanteau of "constructed language". It's a metaportmanteau, if you will.

[conlang]: https://en.wikipedia.org/wiki/Constructed_language
[interlinear]: https://en.wikipedia.org/wiki/Interlinear_gloss
[portmanteau]: https://en.wikipedia.org/wiki/Portmanteau

## Code structure

The eventual goal of Condict is to be distributable as a standalone Electron app, as well as separate server and admin area components for websites. Each folder in the repo is its own package:

* [a11y-utils/](./a11y-utils): Various small utility functions and React components for accessibility features.
* [admin-ui/](./admin-ui): UI components for the admin interface.
* [gen-id/](./gen-id): A microscopic package which exports a single function that generates a random-enough ID string.
* [server/](./server): The storage backend.
* [table-editor/](./table-editor): UI components for editing inflection tables. Separate package because of its size and complexity.

TODO: documentation.
