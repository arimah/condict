import React, {Ref, HTMLAttributes, useRef, useEffect} from 'react';

import {FocusTrap, combineRefs} from '@condict/ui';

import * as S from './styles';

export type Props = {
  placement: PlacementRect;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  onPointerDownOutside?: (target: Element) => void;
} & Omit<
  HTMLAttributes<HTMLFormElement>,
  'placement' | 'role' | 'tabIndex' | 'aria-modal'
>;

export type PlacementRect = {
  readonly x: number;
  readonly y: number;
  readonly parentWidth: number;
};

export const PlacementRect = {
  equals(left: PlacementRect, right: PlacementRect): boolean {
    return (
      left.x === right.x &&
      left.y === right.y &&
      left.parentWidth === right.parentWidth
    );
  },
};

/** Distance from edge of container. */
const Margin = 6;

const Popup = React.forwardRef((
  props: Props,
  ref: Ref<HTMLFormElement>
): JSX.Element => {
  const {
    placement,
    style,
    trapFocus = false,
    restoreFocus = false,
    onPointerDownOutside,
    children,
    ...otherProps
  } = props;

  const ownRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (ownRef.current) {
      const width = ownRef.current.offsetWidth;
      const x = Math.max(
        Math.min(
          placement.x,
          placement.parentWidth - width - Margin
        ),
        Margin
      );
      ownRef.current.style.left = `${x}px`;
      ownRef.current.style.visibility = 'visible';
    }
  });

  return (
    <FocusTrap
      active={trapFocus}
      return={restoreFocus}
      onPointerDownOutside={onPointerDownOutside}
    >
      <S.Popup
        {...otherProps}
        style={{
          ...style,
          top: `${placement.y}px`,
        }}
        ref={combineRefs(ref, ownRef)}
      >
        {children}
      </S.Popup>
    </FocusTrap>
  );
});

Popup.displayName = 'Popup';

export default Popup;
