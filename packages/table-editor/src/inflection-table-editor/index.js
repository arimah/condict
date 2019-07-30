import makeTableEditor from '../table-editor';

import Value from './value';
import CellData from './cell-data';
import CellEditor from './cell-editor';
import commands from './commands';
import getCellDescription from './get-cell-description';

export {Value as InflectionTableValue};

export const InflectionTableEditor = makeTableEditor({
  Value,
  CellData,
  CellEditor,
  getCellDescription,
  commands,
  canEditStructure: true,
  canSelectMultiple: true,
  canEditCell: () => true,
});

InflectionTableEditor.displayName = 'InflectionTableEditor';
