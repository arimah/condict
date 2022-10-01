import React, {ReactNode, useCallback, useContext} from 'react';

import {selectPlatform} from '@condict/platform';

import {Shortcut, SingleShortcut} from './shortcut';

type ShortcutFormatter = (shortcut: Shortcut) => string;

const DefaultModifiers: ModifierNames = {
  control: 'Ctrl',
  shift: 'Shift',
  alt: 'Alt',
  windows: 'Win',
  super: 'Super',
};

const translateKeyDefault = (key: string): string => {
  switch (key) {
    case 'ArrowDown': return 'Down';
    case 'ArrowLeft': return 'Left';
    case 'ArrowRight': return 'Right';
    case 'ArrowUp': return 'Up';
    default: return key;
  }
};

const ShortcutFormatterContext = React.createContext<ShortcutFormatter>(
  shortcut => formatShortcut(
    shortcut,
    DefaultModifiers,
    translateKeyDefault
  )
);

export interface ShortcutFormatProviderProps {
  modifiers: ModifierNames;
  translateKey: (key: string) => string;
  children: ReactNode;
}

export interface ModifierNames {
  /**
   * The the Ctrl key (Windows and *nix; macOS Control key uses a hardcoded
   * symbol, `⌃`).
   */
  readonly control: string;
  /** The Shift key (Windows and *nix; macOS uses a hardcoded symbol, `⇧`). */
  readonly shift: string;
  /**
   * The Alt key (Windows and *nix only; macOS Option key uses a hardcoded
   * symbol, `⌥`).
   */
  readonly alt: string;
  /**
   * The Windows key (Windows only; `super` on *nix; no equivalent on macOS).
   */
  readonly windows: string;
  /**
   * The Super key (*nix only; `windows` on Windows; no equivalent on macOS).
   */
  readonly super: string;
  // Not mentioned: macOS Command key, which again uses a hardcoded symbol, `⌘`.
}

export const ShortcutFormatProvider = (
  props: ShortcutFormatProviderProps
): JSX.Element => {
  const {modifiers, translateKey, children} = props;

  const format = useCallback<ShortcutFormatter>(
    shortcut => formatShortcut(shortcut, modifiers, translateKey),
    [modifiers, translateKey]
  );

  return (
    <ShortcutFormatterContext.Provider value={format}>
      {children}
    </ShortcutFormatterContext.Provider>
  );
};

export const useShortcutFormatter = (): ShortcutFormatter =>
  useContext(ShortcutFormatterContext);

export interface ShortcutNameProps {
  of: Shortcut;
}

export const ShortcutName = (props: ShortcutNameProps): JSX.Element => {
  const {of: shortcut} = props;
  const format = useContext(ShortcutFormatterContext);
  return <>{format(shortcut)}</>;
};

const formatShortcut = (
  shortcut: Shortcut,
  modifiers: ModifierNames,
  translateKey: (key: string) => string
): string => {
  if (shortcut.shortcuts) {
    shortcut = shortcut.shortcuts[0];
  }
  const key = shortcut.keys[0];
  return (
    formatModifiers(shortcut, modifiers) +
    translateKey(key === ' ' ? 'Space' : key)
  );
};

type ModifierFormatter = (shortcut: SingleShortcut, names: ModifierNames) => string;

const formatModifiers: ModifierFormatter = selectPlatform({
  macos: ({primary, secondary, shift, alt}) =>
    // macOS order: Ctrl+Opt+Shift+Cmd+(key)
    // U+2325 = ⌥ Option Key
    // U+21E7 = ⇧ Upwards White Arrow, aka shift
    // U+2318 = ⌘ Place Of Interest Sign, aka Cmd
    // U+2023 = ⌃ Up Arrowhead, aka Ctrl
    (secondary ? '\u2303' : '') +
    (alt ? '\u2325' : '') +
    (shift ? '\u21E7' : '') +
    (primary ? '\u2318' : ''),
  windows: ({primary, secondary, shift, alt}, n) =>
    // Windows order: Win+Ctrl+Alt+Shift+(key)
    (secondary ? n.windows + '+' : '') +
    (primary ? n.control + '+' : '') +
    (alt ? n.alt + '+' : '') +
    (shift ? n.shift + '+' : ''),
  other: ({primary, secondary, shift, alt}, n) =>
    // Linux order: Super+Ctrl+Alt+Shift+(key)
    (secondary ? n.super + '+' : '') +
    (primary ? n.control + '+' : '') +
    (alt ? n.alt + '+' : '') +
    (shift ? n.shift + '+' : ''),
});
