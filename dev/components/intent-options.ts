import {Intent} from '@condict/ui';

interface IntentOption {
  readonly value: Intent;
  readonly name: string;
}

const IntentOptions: readonly IntentOption[] = [
  {value: 'primary', name: 'primary'},
  {value: 'secondary', name: 'secondary'},
  {value: 'danger', name: 'danger'},
];

export default IntentOptions;
