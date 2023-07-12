import {MarkerLocation, SelectOption} from '@condict/ui';

const MarkerLocationOptions: readonly SelectOption<MarkerLocation>[] = [
  {value: 'before', name: 'before'},
  {value: 'after', name: 'after'},
  {value: 'above', name: 'above'},
  {value: 'below', name: 'below'},
];

export default MarkerLocationOptions;
