import {MarkerLocation} from '@condict/ui';

interface MarkerLocationOption {
  readonly value: MarkerLocation;
  readonly name: string;
}

const MarkerLocationOptions: readonly MarkerLocationOption[] = [
  {value: 'before', name: 'before'},
  {value: 'after', name: 'after'},
  {value: 'above', name: 'above'},
  {value: 'below', name: 'below'},
];

export default MarkerLocationOptions;
