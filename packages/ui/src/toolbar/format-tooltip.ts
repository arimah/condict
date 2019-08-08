import {ShortcutType} from '../command/shortcut';

export default (label: string | null, shortcut: ShortcutType | undefined | null) => {
  if (!label) {
    if (shortcut) {
      // A shortcut with no label? Display the shortcut on its own.
      return String(shortcut);
    }
    return undefined;
  }

  if (shortcut) {
    return `${label} (${shortcut})`;
  }
  return label;
};
