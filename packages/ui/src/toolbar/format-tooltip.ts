import {ShortcutType} from '../command/shortcut';

const formatTooltip = (
  label: string | null,
  shortcut: ShortcutType | undefined | null
): string | undefined => {
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

export default formatTooltip;
