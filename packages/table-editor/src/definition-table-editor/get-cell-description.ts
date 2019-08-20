import {Cell} from '../value/types';

import {DataFields, Messages} from './types';

export default (cell: Cell<DataFields>, messages: Messages) => {
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
