import {Cell} from '../value/types';

import {DataFields} from './types';

export default (cell: Cell<DataFields>) => {
  let description = '';
  if (!cell.header) {
    const {data} = cell;
    if (!data.deriveLemma) {
      description += 'Not added to the dictionary. ';
    }
    if (data.hasCustomDisplayName) {
      description += 'Form has custom name. ';
    }
  }
  return description;
};
