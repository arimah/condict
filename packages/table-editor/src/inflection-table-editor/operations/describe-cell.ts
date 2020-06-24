import {Cell} from '../../value';

import {InflectionTableData, Messages} from '../types';

const getCellDescription = (
  messages: Messages,
  cell: Cell,
  data: InflectionTableData
): string => {
  let description = '';
  if (!cell.header) {
    if (!data.deriveLemma) {
      description += `${messages.noDerivedLemma()} `;
    }
    if (data.hasCustomDisplayName) {
      description += `${messages.hasCustomName()} `;
    }
  }
  return description;
};

export default getCellDescription;
