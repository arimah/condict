import {Shortcut} from '../shortcut';

const formatTooltip = (
  label: string | null,
  shortcut: Shortcut | undefined | null
): string | undefined => {
  if (!label) {
    if (shortcut) {
      // A shortcut with no label? Display the shortcut on its own.
      return Shortcut.format(shortcut);
    }
    return undefined;
  }

  if (shortcut) {
    return `${label} (${Shortcut.format(shortcut)})`;
  }
  return label;
};

export default formatTooltip;
