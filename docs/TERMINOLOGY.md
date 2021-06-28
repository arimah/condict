# Terminology

* A ***language*** is a language. Each language owns any number of parts of speech and definitions, and an optional free-form description.
* A ***part of speech*** provides a means of grouping words by function – verb, noun, adjective, personal pronoun, demonstrative determiner, etc. Each part of speech owns any number of inflection tables.
* An ***inflection table*** defines patterns for inflecting words within a part of speech. Each inflection table owns any number of inflection table layouts, of which at most one is current and the rest are earlier versions. These are often called *tables* for short.
* An ***inflection table layout*** describes the actual appearance of a table: it defines the rows, header cells and data cells present in the table. Each data cell contains an inflected form. Each table layout owns any number of inflected forms.
* An ***inflected form*** uses a pattern like `{~}inn` to describe an inflection rule. The text within curly brackets is a stem name. An inflected form can be marked as deriving a lemma, which means that words inflected according to that form are added to the dictionary as derived definitions.
* A ***lemma*** is a grouping of definitions. It is the name under which one or more definitions are listed, such as *bird*, *lizard*, *spoon*. Lemmas are managed automatically by the dictionary; the user only directly edits definitions. When a lemma contains multiple definitions, they usually differ in part of speech, inflection, etymology, or some other feature.

  In UIs, the word "lemma" is not used. Instead we prefer the more sensible term *headword*.
* A ***definition*** defines a word in the dictionary. There are two kinds of definitions:
  - Without further qualification, a plain *definition* is a word definition. It has a part of speech, a free-form description, any number of tags, stems and/or inflection tables that describe how the particular word is inflected.
  - When a regular definiton is inflected, a ***derived definiton*** may be created. If the inflected form is marked as deriving a lemma, a definition is added for that inflected form. For example, *birds* might be added as the plural of *bird*.
* A ***stem*** is a form of a word used for inflections. An inflection pattern might be `{Plural root}en`, in which `{Plural root}` will be replaced by the definition's stem named `Plural root`. Stems can be used to describe sound and word changes that are regular but not possible to express through simple affixes on the lemma form.
* A ***definition inflection table*** is an inflection table attached to a definition. It describes how to inflect that particular definition. A definition can have any number of inflection tables, as long as they all belong to the same part of speech as the definition.
* A ***custom form*** overrides a single inflected form in a definition inflection table. They are usually used for irregular forms. For instance, the plural inflection of English words that end in *-s*, *-z* or *-x* is mostly `{~}es`, but the irregular plural of *ox* is *oxen*, for which a custom form might be used.
* A ***tag*** is an arbitrary categorisation of definitions.
