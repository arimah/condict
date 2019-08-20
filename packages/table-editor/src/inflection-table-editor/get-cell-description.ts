import {Cell} from '../value/types';

import {DataFields, Messages} from './types';

export default (cell: Cell<DataFields>, messages: Messages) => {
  let description = '';
  if (!cell.header) {
    const {data} = cell;
    if (!data.deriveLemma) {
      description += `${messages.noDerivedLemma()} `;
    }
    if (data.hasCustomDisplayName) {
      description += `${messages.hasCustomName()} `;
    }
  }
  return description;
};
