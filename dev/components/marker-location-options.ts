import {MarkerLocation} from '@condict/ui';

interface IntentOption {
  readonly value: MarkerLocation;
  readonly name: string;
}

const IntentOptions: readonly IntentOption[] = [
  {value: 'before', name: 'before'},
  {value: 'after', name: 'after'},
  {value: 'above', name: 'above'},
  {value: 'below', name: 'below'},
];

export default IntentOptions;
