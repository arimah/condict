import {Shortcut, useShortcutFormatter} from '../shortcut';

const useTooltip = (
  label: string | null,
  shortcut: Shortcut | undefined | null
): string | undefined => {
  const formatShortcut = useShortcutFormatter();

  if (!label) {
    if (shortcut) {
      // A shortcut with no label? Display the shortcut on its own.
      return formatShortcut(shortcut);
    }
    return undefined;
  }

  if (shortcut) {
    return `${label} (${formatShortcut(shortcut)})`;
  }
  return label;
};

export default useTooltip;
