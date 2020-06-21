import {Cell} from '../value/types';

import {DataFields, Messages} from './types';

const getCellDescription = (
  cell: Cell<DataFields>,
  messages: Messages
): string => {
  if (!cell.header) {
    const {data} = cell;
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

export default getCellDescription;
