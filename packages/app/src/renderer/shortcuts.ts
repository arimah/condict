import {Shortcut, WritingDirection} from '@condict/ui';

// Various shared shortcuts (often just plain keys) that should be consistent
// across the app.

export type DirectionRelativeShortcut = Readonly<
  Record<WritingDirection, Shortcut>
>;

/** Generic default key for dismissing dialogs and similar (Escape). */
export const CancelKey = Shortcut.parse('Escape');

/** Generic default key for accepting dialogs and similar (Enter). */
export const AcceptKey = Shortcut.parse('Enter');

/** Key for moving to the previous tab in a vertical tab list. */
export const VerticalTabPrevKey: DirectionRelativeShortcut = {
  ltr: Shortcut.parse('ArrowUp ArrowLeft'),
  rtl: Shortcut.parse('ArrowUp ArrowRight'),
};


/** Key for moving to the next tab in a vertical tab list. */
export const VerticalTabNextKey: DirectionRelativeShortcut = {
  ltr: Shortcut.parse('ArrowDown ArrowRight'),
  rtl: Shortcut.parse('ArrowDown ArrowLeft'),
};

/** Key for increasing a slider's value by one tick.  */
export const SliderDecreaseKey = VerticalTabPrevKey;

/** Key for decreasing a slider's value by one tick.  */
export const SliderIncreaseKey = VerticalTabNextKey;

/** Key for setting a slider to its minimum value. */
export const SliderMinKey = Shortcut.parse('Home');

/** Key for setting a slider to its maximum value. */
export const SliderMaxKey = Shortcut.parse('End');
