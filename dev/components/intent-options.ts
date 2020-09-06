import {Intent} from '@condict/ui';

interface IntentOption {
  readonly value: Intent;
  readonly name: string;
}

const IntentOptions: readonly IntentOption[] = [
  {value: 'primary' as Intent, name: 'primary'},
  {value: 'secondary' as Intent, name: 'secondary'},
  {value: 'danger' as Intent, name: 'danger'},
];

export default IntentOptions;
