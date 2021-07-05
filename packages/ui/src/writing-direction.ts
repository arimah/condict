import React, {useContext} from 'react';

/**
 * The (horizontal) direction of writing – `ltr` for left-to-right, `rtl` for
 * right-to-left. Vertical writing is not supported.
 */
export type WritingDirection = 'ltr' | 'rtl';

const WritingDirectionContext = React.createContext<WritingDirection | null>(
  null
);

/**
 * Provides a writing direction.
 */
export const WritingDirectionProvider = WritingDirectionContext.Provider;

/**
 * Acquires the nearest writing direction context.
 */
export const useWritingDirection = (): WritingDirection => {
  const dir = useContext(WritingDirectionContext);
  if (dir === null) {
    // If no writing direction has been provided, get it from the <html>
    // element. This value will not be dynamically updated if the attribute
    // changes.
    const html = document.documentElement;
    return html.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
  }
  return dir;
};
