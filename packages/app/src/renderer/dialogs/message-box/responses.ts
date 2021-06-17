import {selectPlatform} from '@condict/platform';
import {MessageBoxButton} from './types';

const Yes: MessageBoxButton<true> = {
  value: true,
  labelKey: 'message-box-yes',
  bold: true,
  intent: 'accent',
  disposition: 'primary',
};

const No: MessageBoxButton<false> = {
  value: false,
  labelKey: 'message-box-no',
};

export const YesNo: readonly MessageBoxButton<boolean>[] = selectPlatform({
  windows: [Yes, No],
  default: [No, Yes],
});

const OK: MessageBoxButton<true> = {
  value: true,
  labelKey: 'message-box-ok',
  bold: true,
  intent: 'accent',
  disposition: 'primary',
};

const Cancel: MessageBoxButton<false> = {
  value: false,
  labelKey: 'message-box-cancel',
  disposition: 'cancel',
};

export const OKCancel: readonly MessageBoxButton<boolean>[] = selectPlatform({
  windows: [OK, Cancel],
  default: [Cancel, OK],
});
