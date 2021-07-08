# The language's writing direction. Valid values are:
#
# * ltr = Left-to-right
# * rtl = Right-to-left
#
# Vertical writing is not supported.
dir = ltr

## Sidebar messages

sidebar-search-button = Search the dictionary

# Keep short whenever possible, but don't abbreviate unless absolutely required.
# Avoid translating as "Update available"; prefer an actionable verb so it's
# clear the button can be clicked.
sidebar-update-button = Download update

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

## Settings > Appearance section

settings-theme-label = Theme

settings-theme-system = Same as system

settings-theme-light = Light

settings-theme-dark = Dark

settings-accent-color-label = Accent colour

# Can also be translated as "warning colour", "caution colour", "signal colour"
# or equivalent.
settings-danger-color-label = Danger colour

settings-danger-color-description = This colour is used for destructive actions, such as “Delete” buttons.

settings-sidebar-color-label = Sidebar colour

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

settings-locale-en = English (United Kingdom)

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

settings-updates-available = A new version is available.

settings-updates-downloaded = Condict will be updated next time it starts.

## Various temporary test messages

test-dialog-title = Is this message box working?
