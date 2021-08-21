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

sidebar-home-tab-title = Condict

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

settings-color-name-yellow = Yellow

settings-color-name-green = Green

settings-color-name-blue = Blue

settings-color-name-purple = Purple

settings-color-name-gray = Grey

settings-zoom-level-label = Zoom level

settings-zoom-level-description = Changes the scale of the user interface.

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
#   target: The link target. This is either hte name of a dictionary resource or a URL.
rich-text-edit-link-label = Edit link: {$target} - {$targetType}

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
rich-text-ipa-dialog-no-matches = No matches for <query>{$query}</query>.

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

table-editor-import-layout-title = Import layout

table-editor-import-same-pos-heading = From the same part of speech

table-editor-import-same-pos-empty = There are no other inflection tables in this part of speech.

table-editor-import-other-pos-heading = From another part of speech

table-editor-import-other-pos-empty = There are no inflection tables in any other part of speech in this language.

table-editor-import-open-table-button = View the table in a new tab

table-editor-import-error = The selected table could not be loaded. It may help to try again.

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

home-recent-language-description = Language.

# Variables:
#   language: The name of the language that the definition is in.
# Elements:
#   <lang-link>: Link to the language that the definition is in. Wraps around $language.
home-recent-definition-description = Definition in <lang-link>{$language}</lang-link>.

# Variables:
#   language: The name of the language that the part of speech is in.
# Elements:
#   <lang-link>: Link to the language that the part of speech is in. Wraps around $language.
home-recent-part-of-speech-description = Part of speech in <lang-link>{$language}</lang-link>.

# Variables:
#   partOfSpeech: The name of the part of speech that the inflection table belongs to.
#   language: The name of the language that the inflection table is in.
# Elements:
#   <pos-link>: Link to the part of speech that the inflection table belongs to. Wraps around $partOfSpeech.
#   <lang-link>: Link to the language that the definition is in. Wraps around $language.
home-recent-inflection-table-description =
    Inflection table of <pos-link>{$partOfSpeech}</pos-link> in <lang-link>{$language}</lang-link>.

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

language-add-part-of-speech-button = Add part of speech

language-no-parts-of-speech-description =
  There are no parts of speech in this language. Parts of speech are a way to group your words. They can also contain inflection rules for words.

language-tags-heading = Tags

language-no-tags-description = The definitions in this language do not have any tags. You can add tags to a definition when you create or edit it.

# Variables:
#   tableCount: The total number of inflection tables in the part of speech.
language-part-of-speech-tables =
  {$tableCount ->
    [0] No inflection tables
    [one] {$tableCount} inflection table
   *[other] {$tableCount} inflection tables
  }

# Variables:
#   definitionCount: The total number of definitions that use the part of speech.
language-part-of-speech-used-by-definitions =
  {$definitionCount ->
    [0] Not used by any definitions
    [one] Used by {$definitionCount} definition
   *[other] Used by {$definitionCount} definitions
  }

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

language-add-part-of-speech-title = Add part of speech

## Definition messages

definition-added-on = Added {DATETIME($time, dateStyle: "short", timeStyle: "short")}

definition-edited-on = Edited {DATETIME($time, dateStyle: "short", timeStyle: "short")}

## Part of speech messages

# Variables:
#   language: The name of the language that the part of speech belongs to.
#
# Elements:
#   <lang-link>: Link to the language that the part of speech belongs to. Wraps around $language.
part-of-speech-subheading = Part of speech in language <lang-link>{$language}</lang-link>

part-of-speech-tables-heading = Inflection tables

part-of-speech-table-used-by-definitions =
  {$definitionCount ->
    [0] Not used by any definitions
    [one] Used by {$definitionCount} definition
   *[other] Used by {$definitionCount} definitions
  }

part-of-speech-definitions-heading = Definitions of this part of speech

part-of-speech-browse-definitions-title =
  Browse {$definitionCount ->
    [one] {$definitionCount} definition
   *[other] all {$definitionCount} definitions
  } of this part of speech

part-of-speech-no-definitions-description = Words that use this part of speech will show up here when you add the part of speech a definition.

part-of-speech-added-on = Added {DATETIME($time, dateStyle: "short", timeStyle: "short")}

part-of-speech-edited-on = Edited {DATETIME($time, dateStyle: "short", timeStyle: "short")}

part-of-speech-add-table-button = Add inflection table

part-of-speech-no-tables-description = There are no inflection tables in this part of speech. Inflection tables can be added to a word to display its inflected forms. Inflected forms can also be added to the dictionary as searchable terms.

part-of-speech-name-label = Name

part-of-speech-name-required-error = A part of speech name is required.

part-of-speech-name-taken-error = The language already has a part of speech with this name. The name must be unique within the language.

part-of-speech-edit-title = Edit part of speech

part-of-speech-delete-title = Delete part of speech

# Elements:
#   <bold>: Bold text.
part-of-speech-delete-confirm = The part of speech and all inflection tables in it will be deleted. This <bold>cannot be undone</bold>.

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

part-of-speech-delete-button = Delete part of speech and tables

part-of-speech-delete-error = An error occurred when deleting the part of speech. It may help to try again.

part-of-speech-save-error = An error occurred when saving the part of speech. {-check-form-data}

part-of-speech-not-found-error = Part of speech not found. This part of speech has been deleted.

part-of-speech-add-table-title = Add inflection table

## Inflection table messages

# Variables:
#   partOfSpeech: The name of the part of speech that the table belongs to.
#   language: The name of the language that the table belongs to.
#
# Elements:
#   <pos-link>: Link to the part of speech that the table belongs to. Wraps around $partOfSpeech.
#   <lang-link>: Link to the language that the table belongs to. Wraps around $language.
inflection-table-subheading = Inflection table in part of speech <pos-link>{$partOfSpeech}</pos-link>, in language <lang-link>{$language}</lang-link>

inflection-table-layout-heading = Layout

inflection-table-added-on = Added {DATETIME($time, dateStyle: "short", timeStyle: "short")}

inflection-table-edited-on = Edited {DATETIME($time, dateStyle: "short", timeStyle: "short")}

inflection-table-name-label = Name

inflection-table-name-required-error = An inflection table name is required.

inflection-table-name-taken-error = The part of speech already has an inflection table with this name. The name must be unique within the part of speech.

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
