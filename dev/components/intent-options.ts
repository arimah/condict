import {Intent} from '@condict/ui';

interface IntentOption {
  readonly value: Intent;
  readonly name: string;
}

const IntentOptions: readonly IntentOption[] = [
  {value: 'general', name: 'general'},
  {value: 'accent', name: 'accent'},
  {value: 'danger', name: 'danger'},
];

export default IntentOptions;
