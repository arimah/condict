import {MouseEvent, AnchorHTMLAttributes, useCallback} from 'react';

import {selectPlatform} from '@condict/platform';

import {Page} from '../pages';
import {useNavigateTo} from '../navigation';

export type Props = {
  to: Page;
  newTab?: boolean;
} & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target'
>;

const hasPrimaryModifier = selectPlatform({
  macos: (e: MouseEvent) => e.metaKey,
  default: (e: MouseEvent) => e.ctrlKey,
});

const Link = (props: Props): JSX.Element => {
  const {
    to: targetPage,
    newTab,
    onClick,
    onAuxClick,
    children,
    ...otherProps
  } = props;

  const navigateTo = useNavigateTo();

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    // If the default has *already* been prevented, then we cancel navigation.
    if (e.isDefaultPrevented()) {
      return;
    }
    // Otherwise, prevent default now so the browser window doesn't navigate.
    e.preventDefault();
    navigateTo(targetPage, {
      openInNewTab: newTab || hasPrimaryModifier(e),
      openInBackground: hasPrimaryModifier(e),
    });
  }, [navigateTo, targetPage, newTab, onClick]);

  const handleAuxClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (onAuxClick) {
      onAuxClick(e);
    }
    // If the default has *already* been prevented, or the user pressed anything
    // other than the middle mouse button, then we cancel navigation.
    if (e.isDefaultPrevented() || e.button !== 1) {
      return;
    }
    // Otherwise, prevent default now so the browser window doesn't navigate.
    e.preventDefault();
    navigateTo(targetPage, {
      openInNewTab: true,
      openInBackground: true,
    });
  }, [navigateTo, targetPage, newTab, onAuxClick]);

  return (
    <a
      {...otherProps}
      href='condict://internal-link'
      onClick={handleClick}
      onAuxClick={handleAuxClick}
    >
      {children}
    </a>
  );
};

export default Link;
