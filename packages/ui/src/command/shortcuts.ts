import platform from 'platform';

import {Shortcut} from './shortcut';

const isWindows =
  platform.os != null &&
  platform.os.family != null &&
  /windows/i.test(platform.os.family);

export const Shortcuts = Object.freeze({
  undo: Shortcut.parse('Primary+Z z'),
  redo: Shortcut.parse(isWindows ? 'Primary+Y y' : 'Primary+Shift+Z z'),

  cut: Shortcut.parse('Primary+X x'),
  copy: Shortcut.parse('Primary+C c'),
  paste: Shortcut.parse('Primary+V v'),

  selectAll: Shortcut.parse('Primary+A a'),
});
