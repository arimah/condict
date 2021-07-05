import {
  KeyboardEvent,
  MouseEvent as SyntheticMouseEvent,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';

import {
  Shortcut,
  ShortcutMap,
  WritingDirection,
  useWritingDirection,
} from '@condict/ui';

import * as S from './styles';

export type Props = {
  value: number;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onChange: (value: number) => void;
};

type KeyCommand = {
  readonly shortcut: Shortcut;
  readonly exec: (index: number) => number;
};

const ZoomLevels: readonly number[] = [
  50,
  67,
  75,
  90,
  100,
  110,
  125,
  150,
  175,
  200,
];

const MinZoom = ZoomLevels[0];

const MaxZoom = ZoomLevels[ZoomLevels.length - 1];

const getKeyboardMap = (dir: WritingDirection) => new ShortcutMap<KeyCommand>(
  [
    {
      shortcut: Shortcut.parse(
        dir === 'rtl'
          ? 'ArrowRight ArrowDown'
          : 'ArrowLeft ArrowDown'
      ),
      exec: index => Math.max(0, index - 1),
    },
    {
      shortcut: Shortcut.parse(
        dir === 'rtl'
          ? 'ArrowLeft ArrowUp'
          : 'ArrowRight ArrowUp'
      ),
      exec: index => Math.min(ZoomLevels.length - 1, index + 1),
    },
    {
      shortcut: Shortcut.parse('Home'),
      exec: () => 0,
    },
    {
      shortcut: Shortcut.parse('End'),
      exec: () => ZoomLevels.length - 1,
    },
  ],
  cmd => cmd.shortcut
);

const ZoomSlider = (props: Props): JSX.Element => {
  const {value, 'aria-labelledby': ariaLabelledBy, onChange} = props;

  const dir = useWritingDirection();

  const [isDragging, setDragging] = useState(false);
  const [draggingValue, setDraggingValue] = useState(value);
  const keyboardMap = useMemo(() => getKeyboardMap(dir), [dir]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const cmd = keyboardMap.get(e);
    if (cmd && !isDragging) {
      e.preventDefault();
      const currentIndex = ZoomLevels.indexOf(value);
      const nextIndex = cmd.exec(currentIndex);
      onChange(ZoomLevels[nextIndex]);
    }
  }, [value, onChange, isDragging, keyboardMap]);

  const ref = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: SyntheticMouseEvent) => {
    if (ref.current) {
      setDraggingValue(getValueUnderMouse(e.clientX, ref.current, dir));
    }
    setDragging(true);
  }, [onChange, dir]);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        if (ref.current) {
          setDraggingValue(getValueUnderMouse(e.clientX, ref.current, dir));
        }
      };
      const handleMouseUp = (e: MouseEvent) => {
        if (ref.current) {
          const value = getValueUnderMouse(e.clientX, ref.current, dir);
          setDraggingValue(value);
          onChange(value);
        }
        setDragging(false);
      };

      document.body.addEventListener('mousemove', handleMouseMove);
      document.body.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.body.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [onChange, isDragging, dir]);

  const currentValue = isDragging ? draggingValue : value;
  const x = getX(currentValue);
  return (
    <S.Main
      aria-labelledby={ariaLabelledBy}
      aria-valuemin={MinZoom}
      aria-valuemax={MaxZoom}
      aria-valuenow={currentValue}
      aria-valuetext={`${currentValue}%`}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      ref={ref}
    >
      {ZoomLevels.map(zoom =>
        <S.SliderTick
          key={zoom}
          style={{insetInlineStart: `${getX(zoom) * 100}%`}}
        >
          <S.SliderTickLabel $selected={zoom === currentValue}>
            {zoom}
          </S.SliderTickLabel>
        </S.SliderTick>
      )}
      <S.SliderTrack>
        <S.SliderTrackFill style={{
          insetInlineEnd: `calc((100% - 10px) * ${1 - x} + 5px)`,
        }}/>
      </S.SliderTrack>
      <S.SliderThumb style={{insetInlineStart: `${x * 100}%`}}/>
    </S.Main>
  );
};

export default ZoomSlider;

const getX = (value: number) => (value - MinZoom) / (MaxZoom - MinZoom);

const getValueUnderMouse = (
  mouseX: number,
  sliderElem: HTMLDivElement,
  dir: WritingDirection
) => {
  const elemRect = sliderElem.getBoundingClientRect();
  let relativePosition = (mouseX - elemRect.left) / elemRect.width;
  if (dir === 'rtl') {
    relativePosition = 1 - relativePosition;
  }
  const exactZoomLevel = MinZoom + relativePosition * (MaxZoom - MinZoom);
  if (exactZoomLevel < MinZoom) {
    return MinZoom;
  }
  if (exactZoomLevel > MaxZoom) {
    return MaxZoom;
  }
  // Find the nearest permitted zoom level
  for (let i = 0; i < ZoomLevels.length - 1; i++) {
    const a = ZoomLevels[i];
    const b = ZoomLevels[i + 1];
    if (a <= exactZoomLevel && exactZoomLevel <= b) {
      // The value under the mouse is between a and b.
      const distanceFromA = (exactZoomLevel - a) / (b - a);
      return distanceFromA > 0.5 ? b : a;
    }
  }
  // Default zoom level, shouldn't actually be possible to get here.
  return 100;
};
