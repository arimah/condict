import {KeyboardEvent, MouseEvent, useState, useCallback, useRef} from 'react';
import {Localized} from '@fluent/react';

import {ButtonProps, SROnly, Shortcut, useUniqueId} from '@condict/ui';

import * as S from './styles';

export type Props = {
  holdTime?: number;
  onConfirm: () => void;
} & Omit<
  ButtonProps,
  | 'arimah-describedby'
  | 'command'
  | 'type'
  | 'onClick'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onMouseDown'
  | 'onMouseUp'
  | 'onMouseLeave'
  | 'onBlur'
>;

interface HoldState {
  readonly startTime: number;
  readonly timeoutId: number;
  animFrameId: number;
}

const ConfirmKey = Shortcut.parse('Enter Space');

const ConfirmButton = (props: Props): JSX.Element => {
  const {
    holdTime = 3000,
    className,
    bold,
    intent,
    onConfirm,
    children,
    ...otherProps
  } = props;

  const holdState = useRef<HoldState | null>(null);
  const progressRef = useRef<HTMLElement>(null);
  const countdownRef = useRef<HTMLElement>(null);
  const [showHelper, setShowHelper] = useState(false);

  const beginHold = useCallback(() => {
    if (holdState.current) {
      return;
    }

    if (countdownRef.current) {
      countdownRef.current.textContent = '';
    }

    const updateProgress = () => {
      if (!holdState.current) {
        return;
      }

      const timeHeld = Date.now() - holdState.current.startTime;

      if (progressRef.current) {
        const progress = Math.floor(100 * timeHeld / holdTime);
        progressRef.current.style.width = `${progress}%`;
      }

      if (countdownRef.current) {
        const timeLeft = String(Math.ceil((holdTime - timeHeld) / 1000));
        countdownRef.current.textContent = `${timeLeft}`;
      }

      holdState.current.animFrameId = window.requestAnimationFrame(
        updateProgress
      );
    };

    holdState.current = {
      startTime: Date.now(),
      timeoutId: window.setTimeout(() => {
        if (!holdState.current) {
          return;
        }

        window.cancelAnimationFrame(holdState.current.animFrameId);
        holdState.current = null;

        if (progressRef.current) {
          progressRef.current.style.width = '100%';
        }

        onConfirm();
      }, holdTime),
      animFrameId: requestAnimationFrame(updateProgress),
    };
  }, [holdTime, onConfirm]);

  const endHold = useCallback(() => {
    if (holdState.current) {
      window.clearTimeout(holdState.current.timeoutId);
      window.cancelAnimationFrame(holdState.current.animFrameId);
      holdState.current = null;

      // Show the helper in case the user didn't understand what to do.
      setShowHelper(true);
    }

    if (progressRef.current) {
      progressRef.current.style.width = '';
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (Shortcut.matches(ConfirmKey, e)) {
      e.preventDefault();
      if (!e.repeat) {
        beginHold();
      }
    }
  }, [beginHold]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      beginHold();
    }
  }, [beginHold]);

  const id = useUniqueId();

  return (
    <S.Main className={className}>
      <S.Button
        {...otherProps}
        bold={bold}
        intent={intent}
        aria-describedby={id}
        onKeyDown={handleKeyDown}
        onKeyUp={endHold}
        onMouseDown={handleMouseDown}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onBlur={endHold}
      >
        <S.Content>{children}</S.Content>
        <S.Progress bold={bold} intent={intent} ref={progressRef}/>
      </S.Button>
      <S.Helper id={id} $visible={showHelper}>
        <Localized id='generic-press-and-hold-helper'/>
      </S.Helper>
      <SROnly
        aria-live='assertive'
        aria-relevant='text'
        aria-atomic={true}
        ref={countdownRef}
      />
    </S.Main>
  );
};

export default ConfirmButton;
