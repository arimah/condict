# The language's writing direction. Valid values are:
#
# * ltr = Left-to-right
# * rtl = Right-to-left
#
# Vertical writing is not supported.
dir = ltr

## Sidebar messages

sidebar-search-button = Search the dictionary

sidebar-advanced-search-button = Advanced search

sidebar-settings-button = Settings

sidebar-tab-close-button-tooltip = Close tab

sidebar-tab-close-button-unsaved-tooltip =
  {sidebar-tab-close-button-tooltip}
  This tab has unsaved changes.

sidebar-home-tab-title = Home

# Variables:
#   name: The name of the language.
sidebar-language-tab-title = {$name}

# Variables:
#   term: The term that the headword (lemma) defines.
sidebar-lemma-tab-title = {$term}

# Variables:
#   term: The term that the definition defines.
sidebar-definition-tab-title = {$term}

# Variables:
#   name: The name of the part of speech.
sidebar-part-of-speech-tab-title = {$name}

# Variables:
#   name: The name of the inflection table.
sidebar-inflection-table-tab-title = {$name}

# Variables:
#   name: The name of the tag.
sidebar-tag-tab-title = {$name}

# Tab title for a search page with a non-empty search query.
#
# Variables:
#   query: The user's search query.
sidebar-search-with-query-tab-title = Search: {$query}

# Tab title for a search page with an empty search query.
sidebar-search-empty-query-tab-title = Search

## Messages that occur inside the main content area

tab-back-button = Back
# Variables:
#   previousPageTitle: The title of the page that the back button returns to.
tab-back-button-tooltip = Back to {$previousPageTitle}

## Message box messages

# "Yes" button label in a Yes/No message box
message-box-yes = Yes

# "No" button label in a Yes/No message box
message-box-no = No

# "OK" button label in an OK/Cancel message box
message-box-ok = OK

# "Cancel" button label in an OK/Cancel message box
message-box-cancel = Cancel

## Confirm close dialog

confirm-close-title = Discard unsaved changes?

confirm-close-message = Changes you have made will not be saved.

confirm-close-cancel-button = Cancel

confirm-close-discard-button = Discard changes

## Search dialog

search-box-title = Search

search-box-input-label = Search terms

search-box-input-placeholder = Type something to search for!

# Variables:
#   language: The name of the language that will be searched.
#
# Elements:
#   <language>: Wraps around $language. Should not contain anything else.
search-box-in-language-label = Searching only in <language>{$language}</language>

search-box-search-everywhere-button = Search everywhere

search-box-scopes-label = Search in:

search-box-scope-lemmas = Headwords

search-box-scope-definitions = Definitions

search-box-advanced-link = Advanced search

search-box-result-type-lemma = Headword

search-box-result-type-definition = Definition

search-box-no-scopes = No filters are selected.

search-box-no-scopes-helper = Select at least one of the options above to search.

# Variables:
#   query: The user's search query, with leading and trailing white space removed.
#
# Elements:
#   <query>: Wraps around $query. Should not contain anything else.
search-box-no-results = No results were found for <query>{$query}</query>.

search-box-no-results-helper =
  Double-check the spelling or try a different query. Most punctuation is ignored, and accents must match (a ≠ ā).

# Variables:
#   formName: The name of the inflected form.
#   sourceTerm: The term (headword) that the inflected form is based on.
#
# Elements:
#   <term>: Wraps around $sourceTerm. Should not contain anything else.
#
# For example: if formName = Plural and sourceTerm = bird, then the message
# should be something like "Plural of <term>bird</term>"
search-box-result-derived-from = {$formName} of <term>{$sourceTerm}</term>

## Settings dialog

settings-title = Settings

settings-close-button = Close

settings-sidebar-label = Settings sections

settings-section-appearance = Appearance

settings-section-language = Language

settings-section-updates = Application updates

settings-section-storage = Data & storage

settings-section-about = About Condict

## Settings > Appearance section

settings-theme-label = Theme

settings-theme-system = Same as system

settings-theme-light = Light

settings-theme-dark = Dark

settings-accent-color-label = Accent color

# Can also be translated as "warning colour", "caution colour", "signal colour"
# or equivalent.
settings-danger-color-label = Danger color

settings-danger-color-description = This color is used for destructive actions, such as “Delete” buttons, and for error messages.

settings-sidebar-color-label = Sidebar color

settings-color-name-red = Red

settings-color-name-orange = Orange

settings-color-name-yellow = Yellow

settings-color-name-green = Green

settings-color-name-teal = Teal

settings-color-name-blue = Blue

settings-color-name-purple = Purple

settings-color-name-gray = Gray

settings-font-size-label = Font size

# Formats a font size value.
#
# Variables:
#   value: The font size, as an integer value.
settings-font-size-value = {$value}

settings-font-size-description = For larger sizes, use the zoom level option.

settings-line-height-label = Line spacing

# Formats a line spacing value.
#
# Variables:
#   value: The line spacing, as an integer between 0 and 3. The integers correspond to the following values: [0] = 1.25, [1] = 1.5 (the default), [2] = 1.75, [3] = 2. These are technically line *height* values; more appropriate translations may be 0.25, 0.5, 0.75, 1; or ¼, ½, ¾, 1; or 1¼, 1½, 1¾, 2.
settings-line-height-value =
  {$value ->
    [0] 1.25
   *[1] 1.5
    [2] 1.75
    [3] 2
  }

settings-zoom-level-label = Zoom level

settings-zoom-level-description = Changes the scale of the entire user interface.

# Formats a zoom level value.
#
# Variables:
#   value: The zoom level, as an integer percentage.
settings-zoom-level-value = {$value}

settings-motion-label = Reduced motion

settings-motion-full = Full motion and animations

settings-motion-reduced = Reduced motion and animations

settings-motion-reduced-description = Disables short animations, but keeps larger motions and transitions.

settings-motion-none = No motion or animations

settings-motion-none-description = Completely disables all motion and animations.

## Settings > Language section

# Elements:
#   <help-link>: Link to the page where the user can help translate Condict.
settings-help-translate =
  Want Condict in your language? Found a translation error? You can <help-link>help translate Condict</help-link>.

settings-locale-en = English, United States

settings-locale-en-ca = English, Canada

settings-locale-en-gb = English, United Kingdom

settings-locale-sv = Svenska – Swedish

## Settings > Application updates section

# Elements:
#   <privacy-link>: Link to Condict's privacy policy page.
settings-updates-about =
  To provide automatic updates, Condict needs to send a small amount of information about your computer. Condict will never collect or send personal information, or share any part of your dictionary. Read more in the <privacy-link>privacy policy</privacy-link>.

settings-updates-download-label = Download and install updates automatically

settings-updates-download-description = Condict will periodically look for updates. When updates are found, they will be downloaded automatically and installed when you restart Condict.

settings-updates-check-label = Notify me when updates are available

settings-updates-check-description = Condict will periodically look for updates. You will be notified when updates are available, and get to choose when to download and install them.

settings-updates-manual-label = Do not look for updates automatically

settings-updates-manual-description = All automatic updates are disabled. You can still check for updates manually.

settings-updates-check-button = Check for updates

settings-updates-download-button = Download update

settings-updates-install-button = Restart and install update

settings-updates-is-latest = You have the latest version.

settings-updates-available = A new version is available!

settings-updates-checking = Checking for new version...

settings-updates-downloading = Downloading update...

settings-updates-downloaded = The update will be installed next time you start Condict.

## Settings > About section

# Elements:
#   <repo-link>: Link to the Condict repository on GitHub.
settings-about-authors = Condict is developed by Alice Heurlin and is free and open-source software, distributed under the MIT License. <repo-link>The code is available on GitHub.</repo-link>

settings-about-special-thanks = Alice would like to extend special gratitude to the following:

settings-about-special-thanks-list =
  <list-item>M. Damian Mulligan for invaluable technical expertise and continual encouragement.</list-item>

settings-about-third-party-licenses-title = Third-party licenses

settings-about-third-party-licenses-intro = This section does not yet have any content.

## Rich text editor messages

rich-text-format-group = Format

rich-text-bold = Bold

rich-text-italic = Italic

rich-text-underline = Underline

rich-text-strikethrough = Strike through

rich-text-subscript = Subscript

rich-text-superscript = Superscript

rich-text-headings-group = Headings

rich-text-heading1 = Heading 1

rich-text-heading2 = Heading 2

rich-text-list-style-group = List style

rich-text-bulleted-list = Bulleted list

rich-text-numbered-list = Numbered list

rich-text-indent = Increase indentation

rich-text-unindent = Decrease indentation

rich-text-insert-ipa = Insert IPA

rich-text-link-group = Link

rich-text-add-edit-link = Add/edit link

rich-text-remove-link = Remove link

rich-text-contextual-tools-title = Contextual tools

rich-text-edit-link = Edit link

# Screen reader label of "Edit link" button in contextual tools popup.
#
# Variables:
#   target: The link target. This is either the name of a dictionary resource or a URL.
#   targetType: The link target type. See the rich-text-link-type message for details; the value is the same as its $type variable.
rich-text-edit-link-label =
  Edit link: {$target} - {$targetType ->
    [language] language
    [lemma] headword
    [definition] definition
    [partOfSpeech] part of speech
   *[url] web address
  }

# Translates a link target type to a human-readable representation.
#
# Variables:
#   type: The link target type. One of the following values: `language`, `lemma`, `definition`, `partOfSpeech`, `url`
rich-text-link-type =
  {$type ->
    [language] language
    [lemma] headword
    [definition] definition
    [partOfSpeech] part of speech
   *[url] web address
  }

# Keep this label brief, below about 25 graphemes. It's okay to abbreviate "convert" if necessary.
rich-text-convert-to-ipa = Convert to IPA

# Screen reader label of "Convert to IPA" button. This one does not need abbreviating.
#
# Variables:
#   ipa: The IPA text that the user's input will be converted to.
rich-text-convert-to-ipa-label = Convert to IPA: {$ipa}

rich-text-ipa-dialog-title = IPA

# Example search terms. Note that IPA search is currently only available in English.
rich-text-ipa-dialog-placeholder = nasal, alveolar, high tone, Eks-\s{"{"}mp@, ...

rich-text-ipa-dialog-insert = Insert

# Variables:
#   query: The user's search query.
# Elements:
#   <query>: Wraps around $query to highlight it. Should not contain anything else.
rich-text-ipa-dialog-no-matches = No matches for <query>{$query}</query>

rich-text-ipa-dialog-search-hint = Check your spelling or try a less specific query.

rich-text-link-dialog-title = Link target

rich-text-link-dialog-placeholder = Web address or search term

rich-text-link-dialog-save = Save

rich-text-link-dialog-error = Please enter a web address, or a search term to select an item from the dictionary.

# Variables:
#   language: The name of the language that the lemma belongs to.
rich-text-link-search-lemma-description = Headword in {$language}

# Variables:
#   language: The name of the language that the definition belongs to.
rich-text-link-search-definition-description = Definition in {$language}

# Variables:
#   language: The name of the language that the lemma belongs to.
rich-text-link-search-part-of-speech-description = Part of speech in {$language}

## Table editor messages

table-editor-save-cell-sr-helper = Press enter or escape to save and return

table-editor-cell-editor-title = Edit cell

table-editor-cell-value-label = Cell value

# Describes a selection that spans 2 or more columns and 2 or more rows. This message is used when the selection spans at least 2 cells.
#
# Variables:
#   totalCells: The total number of cells that are selected.
#   firstColumn: The 1-based number of the first column in the selection.
#   lastColumn: The 1-based number of the last column in the selection.
#   firstRow: The 1-based number of the first row in the selection.
#   lastRow: The 1-based number of the last row in the selection.
table-editor-selection-columns-rows =
  {$totalCells} cells selected: column {$firstColumn} through {$lastColumn}, row {$firstRow} through {$lastRow}

# Describes a selection that spans 2 or more columns and 1 row. This message is used when the selection spans at least 2 cells.
#
# Variables:
#   totalCells: The total number of cells that are selected.
#   firstColumn: The 1-based number of the first column in the selection.
#   lastColumn: The 1-based number of the last column in the selection.
#   row: The 1-based number of the selected row.
table-editor-selection-columns-1-row =
  {$totalCells} cells selected: column {$firstColumn} through {$lastColumn}, row {$row}

# Describes a selection that spans 1 column and 2 or more rows. This message is used when the selection spans at least 2 cells.
#
# Variables:
#   totalCells: The total number of cells that are selected.
#   column: The 1-based number of the selected column.
#   firstRow: The 1-based number of the first row in the selection.
#   lastRow: The 1-based number of the last row in the selection.
table-editor-selection-1-column-rows =
  {$totalCells} cells selected: column {$column}, row {$firstRow} through {$lastRow}

table-editor-not-derived-lemma = No headword created from this form.

table-editor-not-derived-lemma-icon-title = Headword is not created from this form

table-editor-form-has-custom-name = Form has custom name.

table-editor-form-has-custom-name-icon-title = This form has a custom name

table-editor-header-cell-option-label = Header cell

table-editor-derive-lemma-option-label = Create headword from this form

table-editor-form-name-label = Name of this form:

table-editor-use-automatic-name-button = Use automatic name

table-editor-automatic-name-helper = The name is calculated automatically. Type here to change it.

# Variables:
#   count: The total number of selected cells. The option applies to all of them.
table-editor-header-cell-menu =
  {$count ->
    [one] Header cell
   *[other] Header cells
  }

# Variables:
#   count: The total number of selected cells. The option applies to all of them.
table-editor-derive-lemma-menu =
  {$count ->
    [one] Create headword
   *[other] Create headwords
  }

table-editor-merge-cells = Merge cells

table-editor-separate-cells = Separate cells

table-editor-insert-submenu = Insert

table-editor-insert-row-above = Row above

table-editor-insert-row-above-button = Insert row above

table-editor-insert-row-below = Row below

table-editor-insert-row-below-button = Insert row below

table-editor-insert-column-before = Column before

table-editor-insert-column-before-button = Insert column before

table-editor-insert-column-after = Column after

table-editor-insert-column-after-button = Insert column after

# Variables:
#   count: The total number of selected rows.
table-editor-delete-rows =
  Delete {$count ->
    [1] row
   *[other] {$count} rows
  }

# Variables:
#   count: The total number of selected columns.
table-editor-delete-columns =
  Delete {$count ->
    [1] column
   *[other] {$count} columns
  }

table-editor-form-is-inflected = Form is inflected automatically.

table-editor-form-is-deleted = Form is deleted.

# "Custom" here means that the form is not inflected according to the table's pre-defined rules. It does NOT mean that the form is *irregular* per se, so should not be translated as "irregular form".
# It is acceptable to translate as "special form", "deviating form", or similar, so long as the text does not imply the form *has to be* irregular.
table-editor-custom-form = Custom form.

# See remarks on `table-editor-custom-form`.
table-editor-cell-dialog-input-helper = Type here to define a custom form.

table-editor-use-default-form-button = Revert to default form

table-editor-use-default-form-menu = Use default form

table-editor-delete-form-menu = Delete this form

table-editor-tools-menu = Table tools

table-editor-import-layout-menu = Import layout...

table-editor-transpose-menu = Swap rows and columns

table-editor-rename-forms = Edit all form names...

table-editor-import-layout-title = Import layout

table-editor-import-open-table-button = View the table in a new tab

table-editor-import-no-other-tables = There are no other inflection tables in this language.

table-editor-import-error = The selected table could not be loaded. It may help to try again.

table-editor-rename-forms-title = Edit all form names

table-editor-empty-form-label = (empty cell)

table-editor-derived-name-label = Default name:

table-editor-derived-name-label-tooltip = Default name based on nearby heading cells

table-editor-derived-name-status = This inflected form gets its name from nearby heading cells.

table-editor-custom-name-status = This inflected form has a custom display name.

table-editor-derived-name-tooltip =
  {table-editor-derived-name-status}
  Press to use a custom name, or type over the current name.

table-editor-custom-name-tooltip =
  {table-editor-custom-name-status}
  Press to use the automatic name based on the table’s heading cells.

table-editor-name-source-label = Use automatic name

## Tag input messages

tag-input-new-tag = new tag

# Variables:
#   query: The user's input
# Elements:
#   <query>: Formats the query. Wraps around $query.
tag-input-no-results = No matches for <query>{$query}</query>

tag-input-no-results-helper = Check your spelling or try a less specific query.

tag-input-type-to-search = Type to search for tags

tag-input-no-values = There are no tags to select

## Home page messages

home-languages-title = Languages

home-no-languages-heading = Fiat lingua!

home-no-languages-description = Let’s get started! The first step is to add a language.

# Variables:
#   lemmaCount: The total number of lemmas (headwords) in the language.
#   definitionCount: The total number of definitions in the language.
#   partOfSpeechCount: The total number of parts of speech in the language.
#   tagCount: The total number of unique tags used by definitions in the language.
home-language-statistics =
  {$lemmaCount ->
    [0] No headwords
    [one] {$lemmaCount} headword
   *[other] {$lemmaCount} headwords
  } – {$definitionCount ->
    [0] No definitions
    [one] {$definitionCount} definition
   *[other] {$definitionCount} definitions
  } – {$partOfSpeechCount ->
    [0] No parts of speech
    [one] {$partOfSpeechCount} part of speech
   *[other] {$partOfSpeechCount} parts of speech
  } – {$tagCount ->
    [0] No tags
    [one] {$tagCount} tag
   *[other] {$tagCount} tags
  }

home-add-language-button = Add language

home-add-language-title = Add language

home-tags-title = Tags

home-no-tags-description = Tags will show up here when you add them to word definitions.

home-recent-changes-title = Recent changes

home-no-recent-changes-description = Recent changes will show up here when you add something to the dictionary or edit an existing item.

home-recent-language-description = Language

# Variables:
#   language: The name of the language that the definition is in.
# Elements:
#   <lang-link>: Link to the language that the definition is in. Wraps around $language.
home-recent-definition-description = Definition in <lang-link>{$language}</lang-link>

# Variables:
#   language: The name of the language that the part of speech is in.
# Elements:
#   <lang-link>: Link to the language that the part of speech is in. Wraps around $language.
home-recent-part-of-speech-description = Part of speech in <lang-link>{$language}</lang-link>

# Variables:
#   language: The name of the language that the inflection table is in.
# Elements:
#   <lang-link>: Link to the language that the definition is in. Wraps around $language.
home-recent-inflection-table-description = Inflection table in <lang-link>{$language}</lang-link>

home-recent-added-on = Added {DATETIME($time, dateStyle: "short", timeStyle: "short")}

home-recent-edited-on = Edited {DATETIME($time, dateStyle: "short", timeStyle: "short")}

## Language messages

language-search-button = Search in this language

language-about-heading = About this language

language-words-in-language-heading = Words in this language

# Variables:
#   lemmaCount: The total number of headwords in the language.
language-browse-lemmas-title =
  Browse {$lemmaCount ->
    [one] {$lemmaCount} headword
   *[other] all {$lemmaCount} headwords
  }

# Variables:
#   firstWord: The first headword in the language.
#   lastWord: The last headword in the language.
#
# Elements:
#   <term>: Wraps around $firstWord and $lastWord. Should not contain anything else.
language-browse-lemmas-description =
  Complete list of the headwords in this language, from <term>{$firstWord}</term> to <term>{$lastWord}</term>.

language-no-words-heading = This language has no words!

# This message does not need to be translated literally. Be friendly and playful, and encourage the user to define a word.
language-no-words-description = Every dictionary needs a good vocabulary. Start yours by defining the first word.

language-define-word-button = Define a word

language-recent-definitions-heading = Recent definitions

language-parts-of-speech-heading = Parts of speech

# Variables:
#   definitionCount: The total number of definitions that use the part of speech.
language-part-of-speech-used-by-definitions =
  {$definitionCount ->
    [0] Not used by any definitions
    [one] Used by {$definitionCount} definition
   *[other] Used by {$definitionCount} definitions
  }

language-add-part-of-speech-button = Add part of speech

language-no-parts-of-speech-description =
  There are no parts of speech in this language. Parts of speech are a way to group your words. You can also search for words by part of speech.

language-tables-heading = Inflection tables

language-table-used-by-definitions =
  {$definitionCount ->
    [0] Not used by any definitions
    [one] Used by {$definitionCount} definition
   *[other] Used by {$definitionCount} definitions
  }

language-add-table-button = Add inflection table

language-no-tables-description = There are no inflection tables in this language. Inflection tables can be added to a word to display its inflected forms. Inflected forms can also be added to the dictionary as searchable terms.

language-custom-fields-heading = User-defined fields

language-manage-fields-button = Manage user-defined fields

language-tags-heading = Tags

language-no-tags-description = The definitions in this language do not have any tags. You can add tags to a definition when you create or edit it.

language-added-on = Added {DATETIME($time, dateStyle: "short", timeStyle: "short")}

language-edited-on = Edited {DATETIME($time, dateStyle: "short", timeStyle: "short")}

language-name-label = Name

language-name-required-error = A language name is required.

language-name-taken-error = There is already a language with this name. The language name must be unique.

language-description-label = Description (optional)

language-edit-title = Edit language

language-save-error = An error occurred when saving the language. {-check-form-data}

language-delete-title = Delete language

# Elements:
#   <bold>: Bold text.
language-delete-warning =
  <bold>Hold up!</bold> You are about to <bold>delete an entire language</bold>. This will delete everything associated with the language, and <bold>cannot be undone</bold>.

language-delete-stats-intro = Things that will be deleted include:

# Variables:
#   lemmaCount: The total number of lemmas that will be deleted.
#   definitionCount: The total number of definitions that will be deleted.
#   partOfSpeechCount: The total number of parts of speech that will be deleted.
#
# Elements:
#   <list-item>: Marks an item in the list.
language-delete-stats-list =
  <list-item>{$lemmaCount ->
    [one] {$lemmaCount} headword
   *[other] {$lemmaCount} headwords
  }</list-item>
  <list-item>{$definitionCount ->
    [one] {$definitionCount} definition
   *[other] {$definitionCount} definitions
  }</list-item>
  <list-item>{$partOfSpeechCount ->
    [one] {$partOfSpeechCount} part of speech
   *[other] {$partOfSpeechCount} parts of speech
  }</list-item>

language-delete-confirm = If you are completely sure you want to delete the language, press and hold the button below.

language-delete-button = Delete entire language

language-delete-error = An error occurred when deleting the language. It may help to try again.

language-not-found-error = Language not found. This language has been deleted.

language-define-word-title = Define a word

language-add-part-of-speech-title = Add part of speech

language-manage-fields-title = Manage user-defined fields

language-no-fields = This language has no user-defined fields.

language-add-field-button = Add field

language-add-field-title = Add field

## Lemma (headword) messages

# Variables:
#   language: The name of the language that the headword belongs to.
#
# Elements:
#   <lang-link>: Link to the language that the lemma belongs to. Wraps around $language.
lemma-subheading = Headword in language <lang-link>{$language}</lang-link>

# Variables:
#   n: The definition number (1-based).
lemma-definition-n = Definition {$n}

lemma-definition-link = View full definition – inflection and more

lemma-derived-heading = Inflected forms

lemma-tags-heading = Tags

# Variables:
#   formName: The name of the inflected form.
#   sourceTerm: The term that the derived form comes from.
#
# Elements:
#   <form-link>: Link to the inflected form. Wraps around $form.
#   <def-link>: Link to the original definition that the derived form comes from. Wraps around $sourceTerm.
lemma-derived-from = <form-link>{$formName}</form-link> of <def-link>{$sourceTerm}</def-link>

lemma-not-found-error = Headword not found. This headword has been deleted.

## Definition messages

# Variables:
#   term: The term (headword) that the definition belongs to.
#   language: The name of the language that the definition belongs to.
#   defCount: The total number of definitions in the parent headword.
#
# Elements:
#   <lemma-link>: Link to the headword (lemma) that the definition belongs to. Wraps around $term.
#   <lang-link>: Link to the language that the definition belongs to. Wraps around $language.
definition-subheading =
  {$defCount ->
    [1] Only definition
   *[other] One of {$defCount} definitions
  } of headword <lemma-link>{$term}</lemma-link>, in language <lang-link>{$language}</lang-link>

definition-inflection-heading = Inflection

definition-table-deleted-form = This form is deleted

# Variables:
#   tableName: The name of the table that the layout comes from.
#
# Elements:
#   <table-link>: Link to the table that the layout comes from. Wraps around $tableName.
definition-table-layout-from = From <table-link>{$tableName}</table-link>

definition-tags-heading = Tags

definition-added-on = Added {DATETIME($time, dateStyle: "short", timeStyle: "short")}

definition-edited-on = Edited {DATETIME($time, dateStyle: "short", timeStyle: "short")}

definition-term-label = Term

definition-term-required-error = Please enter a term to define.

definition-part-of-speech-label = Part of speech

# Variables:
#   hasPartsOfSpeech: "yes" if the language has a selectable part of speech; "no" if it has none.
definition-part-of-speech-empty-hint =
  {$hasPartsOfSpeech ->
    [no] (Create a part of speech)
   *[yes] (Select or create a part of speech)
  }

# Variables:
#   hasPartsOfSpeech: "yes" if the language has a selectable part of speech; "no" if it has none.
definition-part-of-speech-required-error =
  The definition must have a part of speech. {$hasPartsOfSpeech ->
    [no] You can create a part of speech using the button above.
   *[yes] Select or create a part of speech.
  }

# Can also be translated as "create part of speech" if that makes more sense. Keep reasonably short.
#
# Avoid translating as "add part of speech". Since the definition only has one part of speech, "add" can be misleading if it sounds like the part of speech will be added to the *definition* rather than the language.
definition-create-part-of-speech-button = New part of speech

definition-description-label = Description

definition-inflection-tables-label = Inflection tables

# Variables:
#   index: The 1-based index of the table.
#   total: The total number of tables in the list.
#   name: The name of the table within the part of speech (not the table caption within the definition).
definition-inflection-table-title = Table {$index} of {$total}: {$name}

definition-table-deleted-heading = (Deleted table)

definition-table-move-up-button = Move up

definition-table-move-down-button = Move down

definition-table-remove-button = Remove table

definition-table-caption-label = Caption (optional)

definition-table-has-new-version-notice = A new version of this table is available.

definition-table-needs-new-version-error = A new version of this table is available. The table must be updated before you save the definition.

definition-table-deleted-error = This table has been deleted. It cannot be added to the definition.

definition-upgrade-layout-button = Update to latest layout

definition-add-table-button = Add inflection table

definition-new-table-menu = New inflection table...

definition-stems-label = Inflection stems

definition-stem-same-as-term-status = This stem is kept identical to the definition term.

definition-stem-custom-status = This stem has a custom value.

definition-stem-same-as-term-tooltip =
  {definition-stem-same-as-term-status}
  Press to use a custom value, or type over the stem value.

definition-stem-custom-tooltip =
  {definition-stem-custom-status}
  Press to revert to the definition term.

definition-stem-source-label = Keep stem identical to the definition term

definition-stems-description = These stem names occur in the selected inflection tables.

definition-tags-label = Tags

definition-custom-fields-global-label =
  <bold>User-defined fields</bold> – All parts of speech

definition-custom-fields-part-of-speech-label =
  <bold>User-defined fields</bold> – {$partOfSpeech}

definition-edit-title = Edit definition

# Elements:
#   <bold>: Bold text.
definition-delete-confirm = The definition will be deleted. This <bold>cannot be undone</bold>.

definition-delete-button = Delete definition

definition-delete-error = An error occurred when deleting the definition. It may help to try again.

definition-save-error = An error occurred when saving the definition. {-check-form-data}

definition-not-found-error = Definition not found. This definition has been deleted.

## Part of speech messages

# Variables:
#   language: The name of the language that the part of speech belongs to.
#
# Elements:
#   <lang-link>: Link to the language that the part of speech belongs to. Wraps around $language.
part-of-speech-subheading = Part of speech in language <lang-link>{$language}</lang-link>

part-of-speech-about-heading = About this part of speech

part-of-speech-definitions-heading = Definitions of this part of speech

part-of-speech-browse-definitions-title =
  Browse {$definitionCount ->
    [one] {$definitionCount} definition
   *[other] all {$definitionCount} definitions
  } of this part of speech

part-of-speech-no-definitions-description = Words that use this part of speech will show up here when you add the part of speech to a definition.

part-of-speech-added-on = Added {DATETIME($time, dateStyle: "short", timeStyle: "short")}

part-of-speech-edited-on = Edited {DATETIME($time, dateStyle: "short", timeStyle: "short")}

part-of-speech-name-label = Name

part-of-speech-name-required-error = A part of speech name is required.

part-of-speech-name-taken-error = The language already has a part of speech with this name. The name must be unique within the language.

part-of-speech-description-label = Description (optional)

part-of-speech-edit-title = Edit part of speech

part-of-speech-delete-title = Delete part of speech

# Elements:
#   <bold>: Bold text.
part-of-speech-delete-confirm = The part of speech will be deleted. This <bold>cannot be undone</bold>.

# Variables:
#   definitionCount: The total number of definitions that use the part of speech.
#
# Elements:
#   <bold>: Bold text.
part-of-speech-delete-not-possible =
    This part of speech <bold>cannot be deleted</bold> because it is in use by {$definitionCount ->
      [one] {$definitionCount} definition
     *[other] {$definitionCount} definitions
    }.

part-of-speech-delete-button = Delete part of speech

part-of-speech-delete-error = An error occurred when deleting the part of speech. It may help to try again.

part-of-speech-save-error = An error occurred when saving the part of speech. {-check-form-data}

part-of-speech-not-found-error = Part of speech not found. This part of speech has been deleted.

part-of-speech-add-table-title = Add inflection table

## Inflection table messages

# Variables:
#   language: The name of the language that the table belongs to.
#
# Elements:
#   <lang-link>: Link to the language that the table belongs to. Wraps around $language.
inflection-table-subheading = Inflection table in language <lang-link>{$language}</lang-link>

inflection-table-layout-heading = Layout

inflection-table-used-by-heading = Definitions with this inflection

inflection-table-not-used-description = This table is not used by any definitions.

# Variables:
#   definitionCount: The total number of definitions that use the table.
inflection-table-browse-definitions-title =
  Browse {$definitionCount ->
    [one] {$definitionCount} definition that uses
   *[other] all {$definitionCount} definitions that use
  } this table

inflection-table-older-layouts-heading = Older layouts

# Variables:
#   definitionCount: The total number of definitions that use at least one older version of the table.
#   layoutCount: The total number of older layouts that exist.
inflection-table-older-layouts =
  There {$definitionCount ->
    [one] is {$definitionCount} definition that uses
   *[other] are {$definitionCount} definitions that use
  } {$layoutCount ->
    [one] an older layout
   *[other] a total of {$layoutCount} older layouts
  } of this table. {$definitionCount ->
    [one] This definition
   *[other] These definitions
  } should be updated to the latest table layout.

inflection-table-definition-has-older-layout = This definition has an older version of the table

inflection-table-added-on = Added {DATETIME($time, dateStyle: "short", timeStyle: "short")}

inflection-table-edited-on = Edited {DATETIME($time, dateStyle: "short", timeStyle: "short")}

inflection-table-name-label = Name

inflection-table-name-required-error = An inflection table name is required.

inflection-table-name-taken-error = The language already has an inflection table with this name. The name must be unique within the lanugage.

inflection-table-layout-label = Layout

inflection-table-edit-title = Edit inflection table

# Elements:
#   <bold>: Bold text.
inflection-table-delete-confirm = The inflection table will be deleted. This <bold>cannot be undone</bold>.

# Variables:
#   definitionCount: The total number of definitions that use the inflection table.
#
# Elements:
#   <bold>: Bold text.
inflection-table-delete-not-possible =
  This inflection table <bold>cannot be deleted</bold> because it is in use by {$definitionCount ->
    [one] {$definitionCount} definition
   *[other] {$definitionCount} definitions
  }.

inflection-table-delete-button = Delete inflection table

inflection-table-delete-error = An error occurred when deleting the inflection table. It may help to try again.

inflection-table-save-error = An error occurred when saving the inflection table. {-check-form-data}

inflection-table-not-found-error = Inflection table not found. This inflection table has been deleted.

## Custom field messages

field-card-type-boolean = Yes/no value

# Variables:
#   listValueCount: The number of values defined in the list field.
field-card-type-list-one =
  List of values (single selection) – {$listValueCount ->
    [0] No values
    [one] {$listValueCount} value
   *[other] {$listValueCount} values
  }

# Variables:
#   listValueCount: The number of values defined in the list field.
field-card-type-list-many =
  List of values (multiple selections) – {$listValueCount ->
    [0] No values
    [one] {$listValueCount} value
   *[other] {$listValueCount} values
  }

field-card-type-text-plain = Text value

field-edit-title = Edit field

field-name-label = Name

field-name-required-error = A field name is required.

field-name-taken-error = The language already has a field with this name. The name must be unique within the language.

field-name-abbr-label = Name abbreviation (optional)

field-parts-of-speech-label = Applicable parts of speech

field-parts-of-speech-description = The field will be visible only in definitions of the selected parts of speech.

field-parts-of-speech-all-label = All parts of speech, including those added in the future

field-value-type-label = Value type

field-value-type-boolean = Yes/no value

field-value-type-list = List of predefined values

field-value-type-plain-text = Text value

field-list-values-label = Available values

field-list-value-value-label = Value

field-list-value-abbr-label = Abbreviation (optional)

field-list-value-empty-error = The value cannot be empty

field-list-value-duplicate-error = This value occurs more than once

field-delete-list-value-button = Delete value

field-add-list-value-button = Add value

field-undo-delete-list-value-button = Undo delete

field-multi-select-label = Allow multiple selected values per definition

# Elements:
#   <bold>: Bold text.
field-delete-confirm = The field will be deleted. It will also disappear from every definition that uses it. This <bold>cannot be undone</bold>.

field-delete-button = Delete field

field-delete-error = An error occurred when deleting the field. It may help to try again.

field-save-error = An error occurred when saving the field. {-check-form-data}

field-not-found-error = Field not found. This field has been deleted.

## Internal link tooltips

# Variables:
#   name: The name of the language.
link-language-tooltip =
  {$name}
  Language

# Variables:
#   term: The lemma term.
#   language: The name of the language that the lemma belongs to.
link-lemma-tooltip =
  {$term}
  Headword in {$language}

# Variables:
#   term: The term that the definition belongs to.
#   language: The name of the language that the definition belongs to.
link-definition-tooltip =
  {$term}
  Definition in {$language}

# Variables:
#   name: The name of the part of speech.
#   language: The name of the language that the part of speech belongs to.
link-part-of-speech-tooltip =
  {$name}
  Part of speech in {$language}

## Generic messages

generic-loading = Loading...

generic-saving = Saving...

generic-broken-link-title = Oops, this link is broken!

generic-broken-link-message = This link leads to a dictionary item that has been deleted.

generic-form-save = Save

generic-form-cancel = Cancel

generic-edit-button = Edit

generic-delete-button = Delete

generic-close-button = Close

generic-undo-button = Undo

generic-redo-button = Redo

generic-press-and-hold-helper = Press and hold to confirm

generic-release-to-confirm-helper = Release to confirm

-check-form-data = Check the information above and try again.

# Variables:
#   errorCount: The number of errors that were returned from the server. Always greater than 0.
fetch-error =
  Something went wrong when loading this content. The following {$errorCount ->
    [one] error was received
   *[other] {$errorCount} errors were received
  }:

fetch-no-data = Something went wrong when loading this content: no data was received.

## Error screen messages

error-title = Oh no!

# Elements:
#   <bold>: Bold text.
error-message = Some part of Condict has crashed. Apologies for the inconvenience. <bold>Your data is safe.</bold> The following error message was received:

error-details-button = Error details

error-details-label = Error details

error-global-next-step = You can try to reload the application. If that doesn’t help, please report the error.

error-tab-next-step = You can try to reload the tab. If that doesn’t help, please report the error.

error-reload-app-button = Reload Condict

error-reload-tab-button = Reload tab

error-report-error-button = Report error

## Shortcuts and key names

# The Ctrl/Control modifier key. Windows and Linux; macOS uses symbols for modifiers.
key-modifier-control = Ctrl

# The Shift modifier key. Windows and Linux; macOS uses symbols for modifiers.
key-modifier-shift = Shift

# The Alt modifier key. Windows and Linux; macOS uses symbols for modifiers.
key-modifier-alt = Alt

# The Windows key, which opens the Start menu, among other things. Windows only.
#
# Linux equivalent: key-modifier-super
#
# macOS uses symbols for modifiers.
key-modifier-windows = Win

# The Super key, which performs various OS-level tasks. Linux only.
#
# Windows equivalent: key-modifier-windows
#
# macOS uses symbols for modifiers.
key-modifier-super = Super

# Translates the name of a keyboard key to a localized form. The key name is either a "raw" key value, that is a letter or several typed by the user such as "v", "3", "!", or a special key name. This message should be used only to translate special key names.
#
# Full list of key names: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
#
# Notes:
#
# * Modifier key names do not need to be translated. They cannot be bound to shortcuts in Condict. Ignore them.
# * Ignore notes about historical browser behaviour. Only modern Chromium matters.
# * Only translate keys that actually need to be translated. If the target language calls it "Home", you don't need to write `[Home] Home`.
# * The spacebar key is given as "Space", not " ". Therefore, match against `[Space]`, not `[ ]`.
# * The default case must be `*[default] {$key}`. The value `{$key}` ensures we never accidentally mess up a legitimate key.
#
# Variables:
#   key: The key name to translate.
key-name =
  {$key ->
    [ArrowUp] Up
    [ArrowDown] Down
    [ArrowLeft] Left
    [ArrowRight] Right
   *[default] {$key}
  }
