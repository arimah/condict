import {
  KeyboardEvent,
  MouseEvent as SyntheticMouseEvent,
  memo,
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

import {
  SliderDecreaseKey,
  SliderIncreaseKey,
  SliderMinKey,
  SliderMaxKey,
} from '../../../shortcuts';

import * as S from './styles';

export type Props<T extends number | string> = {
  /** The slider's possible values. These *must* be ordered by `pos`. */
  stops: readonly SliderStop<T>[];
  value: T;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onChange: (value: T) => void;
};

export interface SliderStop<T extends number | string> {
  /**
   * A numeric representation of the slider stop value, which indicates how
   * far along the track the stop is.
   *
   * The first (lowest position value) and last (highest) are at the far ends
   * of the slider, and all other ticks are placed automatically inbetween.
   */
  readonly pos: number;
  /** The value at the stop. */
  readonly value: T;
}

export interface SliderComponent {
  <T extends number | string>(props: Props<T>): JSX.Element;
  displayName?: string;
}

interface KeyCommand {
  readonly shortcut: Shortcut;
  readonly exec: (index: number, stopCount: number) => number;
}

const getKeyboardMap = (dir: WritingDirection) => new ShortcutMap<KeyCommand>(
  [
    {
      shortcut: SliderDecreaseKey[dir],
      exec: index => Math.max(0, index - 1),
    },
    {
      shortcut: SliderIncreaseKey[dir],
      exec: (index, stopCount) => Math.min(stopCount - 1, index + 1),
    },
    {
      shortcut: SliderMinKey,
      exec: () => 0,
    },
    {
      shortcut: SliderMaxKey,
      exec: (_index, stopCount) => stopCount - 1,
    },
  ],
  cmd => cmd.shortcut
);

const Slider = memo(<T extends string | number>(props: Props<T>): JSX.Element => {
  const {stops, value, 'aria-labelledby': ariaLabelledBy, onChange} = props;

  const dir = useWritingDirection();

  const [isDragging, setDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(() =>
    stops.findIndex(s => s.value === value)
  );
  const keyboardMap = useMemo(() => getKeyboardMap(dir), [dir]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const cmd = keyboardMap.get(e);
    if (cmd && !isDragging) {
      e.preventDefault();
      const currentIndex = stops.findIndex(s => s.value === value);
      const nextIndex = cmd.exec(currentIndex, stops.length);
      onChange(stops[nextIndex].value);
    }
  }, [stops, value, onChange, isDragging, keyboardMap]);

  const ref = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: SyntheticMouseEvent) => {
    if (ref.current) {
      const index = getIndexUnderMouse(e.clientX, ref.current, dir, stops);
      setDraggingIndex(index);
    }
    setDragging(true);
  }, [onChange, dir]);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        if (ref.current) {
          const index = getIndexUnderMouse(e.clientX, ref.current, dir, stops);
          setDraggingIndex(index);
        }
      };
      const handleMouseUp = (e: MouseEvent) => {
        if (ref.current) {
          const index = getIndexUnderMouse(e.clientX, ref.current, dir, stops);
          setDraggingIndex(index);
          onChange(stops[index].value);
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
  }, [stops, onChange, isDragging, dir]);

  const min = stops[0];
  const max = stops[stops.length - 1];
  const currentStop =
    isDragging
      ? stops[draggingIndex]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      : stops.find(s => s.value === value)!;
  const x = getX(currentStop.pos, min.pos, max.pos);

  return (
    <S.Main
      aria-labelledby={ariaLabelledBy}
      aria-valuemin={min.pos}
      aria-valuemax={max.pos}
      aria-valuenow={currentStop.pos}
      aria-valuetext={String(currentStop.value)}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      ref={ref}
    >
      {stops.map(stop =>
        <S.SliderTick
          key={stop.pos}
          style={{
            insetInlineStart: `${getX(stop.pos, min.pos, max.pos) * 100}%`,
          }}
        >
          <S.SliderTickLabel $selected={stop.value === currentStop.value}>
            {String(stop.value)}
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
}) as SliderComponent;

Slider.displayName = 'Slider';

export default Slider;

const getX = (value: number, min: number, max: number) =>
  (value - min) / (max - min);

const getIndexUnderMouse = (
  mouseX: number,
  sliderElem: HTMLDivElement,
  dir: WritingDirection,
  stops: readonly SliderStop<string | number>[]
) => {
  const elemRect = sliderElem.getBoundingClientRect();
  let relativePosition = (mouseX - elemRect.left) / elemRect.width;
  if (dir === 'rtl') {
    relativePosition = 1 - relativePosition;
  }

  const minPos = stops[0].pos;
  const maxPos = stops[stops.length - 1].pos;

  const exactPos = minPos + relativePosition * (maxPos - minPos);
  if (exactPos < minPos) {
    return 0;
  }
  if (exactPos > maxPos) {
    return stops.length - 1;
  }

  // Find the nearest slider stop
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (a.pos <= exactPos && exactPos <= b.pos) {
      // The value under the mouse is between a and b.
      const distanceFromA = (exactPos - a.pos) / (b.pos - a.pos);
      return distanceFromA > 0.5 ? i + 1 : i;
    }
  }
  // It should be impossible to get here, but...
  return 0;
};
