import {RefObject, ReactNode, useCallback, useRef, useEffect} from 'react';

import {useWritingDirection} from '@condict/ui';

import * as S from './styles';

export type Props = {
  className?: string;
  cell: RefObject<HTMLElement>;
  children: ReactNode;
};

// Distance from edge of cell to edge of popup, in pixels.
const HorizontalOffset = -10;
const VerticalOffset = 7;

// Minimum distance from edge of window to edge of popup, in pixels.
const HorizontalPadding = 16;

// Arrow's horizontal offset from edge of cell.
const ArrowOffset = 8;

interface PopupPlacement {
  x: number;
  y: number;
  below: boolean;
  arrowX: number;
}

const CellPopup = (props: Props): JSX.Element => {
  const {className, cell, children} = props;

  const dir = useWritingDirection();

  const mainRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const lastPlacementRef = useRef<PopupPlacement>({
    x: -1,
    y: -1,
    below: true,
    arrowX: -1,
  });

  const updatePosition = useCallback(() => {
    if (!cell.current || !mainRef.current || !arrowRef.current) {
      // Nothing to do
      return;
    }

    const cellRect = cell.current.getBoundingClientRect();
    const main = mainRef.current;
    const arrow = arrowRef.current;
    const {width, height} = main.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x =
      dir === 'ltr'
        ? cellRect.left + HorizontalOffset
        : cellRect.right - HorizontalOffset - width;
    x = Math.max(
      HorizontalPadding,
      Math.min(
        x,
        viewportWidth - width - 2 * HorizontalPadding
      )
    );

    let y = cellRect.bottom + VerticalOffset;
    let below = true;
    // If the viewport is too small to fit the popup below the cell *and* there
    // is enough space to fit it above, then we move it to be above. Otherwise
    // we keep it below, and the user will have to scroll it into view.
    if (
      viewportHeight - y < height &&
      cellRect.top >= height + VerticalOffset
    ) {
      y = cellRect.top - height - VerticalOffset;
      below = false;
    }

    const arrowX =
      dir === 'ltr'
        ? cellRect.left + ArrowOffset - x
        : cellRect.right - ArrowOffset - x;

    const lastPlacement = lastPlacementRef.current;
    if (lastPlacement.x !== x) {
      main.style.left = `${x}px`;
      lastPlacement.x = x;
    }
    if (lastPlacement.y !== y) {
      main.style.top = `${y}px`;
      lastPlacement.y = y;
    }
    if (lastPlacement.below !== below) {
      arrow.style.transform = below ? S.ArrowUp : S.ArrowDown;
      arrow.style.top = below ? S.ArrowAbove : S.ArrowBelow;
      lastPlacement.below = below;
    }
    if (lastPlacement.arrowX !== arrowX) {
      arrow.style.left = `${arrowX}px`;
      lastPlacement.arrowX = arrowX;
    }
  }, [cell, dir]);
  const updatePositionRef = useRef(updatePosition);
  updatePositionRef.current = updatePosition;

  useEffect(() => {
    let requestId: number;

    const frame = () => {
      updatePositionRef.current();
      requestId = window.requestAnimationFrame(frame);
    };
    updatePositionRef.current();
    requestId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(requestId);
    };
  }, []);

  return (
    <S.Main className={className} ref={mainRef}>
      {children}
      <S.Arrow ref={arrowRef}/>
    </S.Main>
  );
};

export default CellPopup;
