import {ReactNode} from 'react';

import {ItemPhase} from '../ui';

export interface Dialog {
  /** A unique, randomly generated identifier for the dialog. */
  readonly id: string;
  /** Renders the main content of the dialog. */
  readonly render: (
    partialProps: Pick<
      DialogProps<unknown>,
      'animationPhase' | 'onAnimationPhaseEnd'
    >
  ) => JSX.Element;
}

export interface DialogParams<R> {
  /**
   * Renders the dialog's content. This is *not* a component type, but a render
   * function that returns a React tree. It is not possible to use hooks inside
   * this callback.
   */
  readonly render: DialogRenderFn<R>;
}

export type DialogRenderFn<R> = (props: DialogProps<R>) => ReactNode;

export type DialogProps<R> = {
  /** The dialog's current animation phase (entering, idle or leaving). */
  animationPhase: ItemPhase;
  /**
   * A function that *must* be called when the dialog's current animation phase
   * ends. When `animationPhase` is `'entering'`, it will advance the phase to
   * `'idle'`. When `animationPhase` is 'leaving'`, it marks the dialog as fully
   * transitioned out, at which point it will be unmounted.
   *
   * If the dialog does not have an entry/exit animation, this function *must*
   * be called in a `useLayoutEffect` when `animationPhase` changes and equals
   * `'entering'` or `'leaving'`.
   */
  onAnimationPhaseEnd: () => void;
  /**
   * A function to be called when the dialog has a result. The dialog will close
   * upon calling this function.
   * @param value The dialog's result value.
   */
  onResolve: (value: R) => void;
};

/**
 * Opens a modal dialog.
 * @param params Dialog parameters.
 * @return A promise that resolves with the result of the modal dialog. The
 *         promise resolves when the dialog closes. The promise is rejected if
 *         the tab or dialog already has a pending dialog.
 */
export type OpenDialogFn = <R>(params: DialogParams<R>) => Promise<R>;
