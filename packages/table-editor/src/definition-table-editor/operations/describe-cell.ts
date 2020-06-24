import {Cell} from '../../value';

import {DefinitionTableData, Messages} from '../types';

const describeCell = (
  messages: Messages,
  cell: Cell,
  data: DefinitionTableData
): string => {
  if (!cell.header) {
    switch (data.customForm) {
      case null:
        return `${messages.formIsInflected()} `;
      case '':
        return `${messages.formIsDeleted()} `;
      default:
        return `${messages.customForm()} `;
    }
  }
  return '';
};

export default describeCell;
