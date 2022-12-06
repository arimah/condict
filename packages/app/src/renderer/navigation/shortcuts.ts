import {Shortcut} from '@condict/ui';

import {selectPlatform} from '@condict/platform';

export default {
  prevTab: selectPlatform({
    macos: Shortcut.parse(['Ctrl+Shift+Tab', 'Primary+ArrowUp']),
    windows: Shortcut.parse(['Primary+Shift+Tab', 'Alt+ArrowUp']),
    other: Shortcut.parse(['Primary+PageUp', 'Primary+Shift+Tab', 'Alt+ArrowUp']),
  }),
  nextTab: selectPlatform({
    macos: Shortcut.parse(['Ctrl+Tab', 'Primary+ArrowDown']),
    windows: Shortcut.parse(['Primary+Tab', 'Alt+ArrowDown']),
    other: Shortcut.parse(['Primary+PageDown Tab', 'Alt+ArrowDown']),
  }),
  back: selectPlatform({
    macos: Shortcut.parse('Primary+ArrowLeft'),
    windows: Shortcut.parse('Alt+ArrowLeft'),
    other: Shortcut.parse('Alt+ArrowLeft'),
  }),
  closeTab: selectPlatform({
    macos: Shortcut.parse('Primary+W w'),
    windows: Shortcut.parse(['Primary+W w', 'Primary+F4']),
    other: Shortcut.parse('Primary+W w'),
  }),
};
