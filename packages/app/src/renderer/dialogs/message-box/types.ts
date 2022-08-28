import {ReactNode} from 'react';

import {ButtonIntent} from '@condict/ui';

export interface MessageBoxParams<R> {
  /** The translation key that contains the message box's title. */
  readonly titleKey: string;
  /** The main message. */
  readonly message: ReactNode;
  /** The response buttons. */
  readonly buttons: readonly MessageBoxButton<R>[];
}

export interface MessageBoxButton<R> {
  /** The value that this button returns when pressed. */
  readonly value: R;
  /** The translation key that contains this button's plain-text label. */
  readonly labelKey: string;
  /** The optional content of the button. This is *not* a translation key. */
  readonly content?: ReactNode;
  /**
   * The intent styling to give the button. If omitted, defaults to 'general'.
   */
  readonly intent?: ButtonIntent;
  /**
   * The button disposition. The primary button (if present) is the initial
   * focus; the cancel button (if present) is activated upon pressing Escape.
   */
  readonly disposition?: MessageBoxButtonDisposition;
}

export type MessageBoxButtonDisposition = 'primary' | 'cancel';
