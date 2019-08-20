import React from 'react';

import {Messages} from './types';

const DefaultMessages: Messages = {
  // eslint-disable-next-line react/display-name
  tableEditorHelper: () =>
    <>Press <b>Enter</b> or <b>F2</b> to edit the current cell.</>,
  // eslint-disable-next-line react/display-name
  cellEditorHelper: () =>
    <>Press <b>Enter</b> or <b>ESC</b> when done.</>,
  cellEditorSRHelper: () => 'Press enter or escape to save and return.',
  cellEditorTitle: () => 'Edit cell',
  cellValueLabel: () => 'Cell value',
  describeSelection(selection) {
    const rowSelection = selection.minRow !== selection.maxRow
      ? `row ${selection.minRow + 1} through ${selection.maxRow + 1}`
      : `row ${selection.minRow + 1}`;
    const colSelection = selection.minCol !== selection.maxCol
      ? `column ${selection.minCol + 1} through ${selection.maxCol + 1}`
      : `column ${selection.minCol + 1}`;
    return `${selection.size} cells selected: ${rowSelection}, ${colSelection}. `;
  },
};

export default DefaultMessages;
