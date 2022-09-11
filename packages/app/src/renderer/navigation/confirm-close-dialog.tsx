import {Localized} from '@fluent/react';

import {selectPlatform} from '@condict/platform';

import {MessageBoxButton, messageBox} from '../dialogs';

const Discard: MessageBoxButton<'discard'> = {
  value: 'discard',
  labelKey: 'confirm-close-discard-button',
  intent: 'bold',
  disposition: 'primary',
};

const Stay: MessageBoxButton<'stay'> = {
  value: 'stay',
  labelKey: 'confirm-close-cancel-button',
  disposition: 'cancel',
};

const ConfirmCloseDialog = messageBox({
  titleKey: 'confirm-close-title',
  message: <Localized id='confirm-close-message'/>,
  buttons: selectPlatform({
    windows: [Discard, Stay],
    default: [Stay, Discard],
  }),
});

export default ConfirmCloseDialog;
