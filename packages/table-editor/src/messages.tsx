import {Messages} from './types';

const DefaultMessages: Messages = {
  cellEditorSRHelper: () => 'Press enter or escape to save and return.',
  cellEditorTitle: () => 'Edit cell',
  cellValueLabel: () => 'Cell value',
  describeSelection(selection) {
    const rowSelection = selection.minRow !== selection.maxRow
      ? `row ${selection.minRow + 1} through ${selection.maxRow + 1}`
      : `row ${selection.minRow + 1}`;
    const colSelection = selection.minColumn !== selection.maxColumn
      ? `column ${selection.minColumn + 1} through ${selection.maxColumn + 1}`
      : `column ${selection.minColumn + 1}`;
    return `${selection.cells.size} cells selected: ${rowSelection}, ${colSelection}. `;
  },
};

export default DefaultMessages;
