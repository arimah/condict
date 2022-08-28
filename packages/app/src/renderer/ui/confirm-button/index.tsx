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
  confirmed: boolean;
}

type Helper = 'press' | 'release' | null;

const ConfirmKey = Shortcut.parse('Enter Space');

const ConfirmButton = (props: Props): JSX.Element => {
  const {
    holdTime = 2000,
    className,
    intent,
    onConfirm,
    children,
    ...otherProps
  } = props;

  const holdState = useRef<HoldState | null>(null);
  const progressRef = useRef<HTMLElement>(null);
  const countdownRef = useRef<HTMLElement>(null);
  const [helper, setHelper] = useState<Helper>(null);

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

      const timeHeld = Math.min(
        Date.now() - holdState.current.startTime,
        holdTime
      );

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
        const state = holdState.current;
        if (!state) {
          return;
        }

        state.confirmed = true;
        window.cancelAnimationFrame(state.animFrameId);

        if (progressRef.current) {
          progressRef.current.style.width = '100%';
        }

        // Tell the user to release now.
        setHelper('release');
      }, holdTime),
      animFrameId: requestAnimationFrame(updateProgress),
      confirmed: false,
    };
  }, [holdTime]);

  const endHold = useCallback(() => {
    const state = holdState.current;
    if (state) {
      window.clearTimeout(state.timeoutId);
      window.cancelAnimationFrame(state.animFrameId);

      if (state.confirmed) {
        void Promise.resolve().then(onConfirm);
      } else {
        // Show helper in case the user didn't understand what to do.
        setHelper('press');
      }

      holdState.current = null;
    }

    if (progressRef.current) {
      progressRef.current.style.width = '';
    }
  }, [onConfirm]);

  const cancelHold = useCallback(() => {
    const state = holdState.current;
    if (state) {
      window.clearTimeout(state.timeoutId);
      window.cancelAnimationFrame(state.animFrameId);

      // Show helper in case the user didn't understand what to do.
      setHelper('press');

      holdState.current = null;
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
        intent={intent}
        aria-describedby={id}
        onKeyDown={handleKeyDown}
        onKeyUp={endHold}
        onMouseDown={handleMouseDown}
        onMouseUp={endHold}
        onMouseLeave={cancelHold}
        onBlur={cancelHold}
      >
        <S.Content>{children}</S.Content>
        <S.Progress ref={progressRef}/>
      </S.Button>
      <S.Helper id={id} $visible={helper !== null}>
        <S.HelperContent>
          <Localized
            id={helper === 'release'
              ? 'generic-release-to-confirm-helper'
              : 'generic-press-and-hold-helper'
            }
          />
        </S.HelperContent>
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
