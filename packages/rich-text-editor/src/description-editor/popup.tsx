import React, {Ref, HTMLAttributes} from 'react';

import {FocusTrap} from '@condict/ui';

import * as S from './styles';

export type Props = {
  width: number;
  placement: PlacementRect;
  trapFocus?: boolean;
  onPointerDownOutside?: (target: Element) => void;
} & Omit<
  HTMLAttributes<HTMLFormElement>,
  'width' | 'placement' | 'role' | 'tabIndex' | 'aria-modal'
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
    width,
    placement,
    style,
    trapFocus = false,
    onPointerDownOutside,
    children,
    ...otherProps
  } = props;

  const x = Math.max(
    Math.min(
      placement.x,
      placement.parentWidth - width - Margin
    ),
    Margin
  );

  return (
    <FocusTrap
      // COMPAT: We need to call ReactEditor.focus on the editor instead of
      // letting FocusTrap handle it for us. I don't know why.
      return={false}
      active={trapFocus}
      onPointerDownOutside={onPointerDownOutside}
    >
      <S.Popup
        {...otherProps}
        style={{
          ...style,
          left: `${x}px`,
          top: `${placement.y}px`,
          width: `${width}px`,
        }}
        ref={ref}
      >
        {children}
      </S.Popup>
    </FocusTrap>
  );
});

Popup.displayName = 'Popup';

export default Popup;
