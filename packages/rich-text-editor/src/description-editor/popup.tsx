import React, {Ref, HTMLAttributes} from 'react';

import * as S from './styles';

export type Props = {
  width: number;
  placement: PlacementRect;
} & Omit<HTMLAttributes<HTMLFormElement>, 'width' | 'placement'>;

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
  const {width, placement, style, children, ...otherProps} = props;

  const x = Math.max(
    Math.min(
      placement.x,
      placement.parentWidth - width - Margin
    ),
    Margin
  );

  return (
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
  );
});

Popup.displayName = 'Popup';

export default Popup;
