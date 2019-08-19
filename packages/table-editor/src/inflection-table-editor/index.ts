import makeTableEditor, {Props as EditorProps} from '../table-editor';

import Value from './value';
import CellData from './cell-data';
import CellEditor from './cell-editor';
import ContextMenu from './context-menu';
import commands from './commands';
import getCellDescription from './get-cell-description';
import {DataFields} from './types';

export {Value as InflectionTableValue};

export type Props = EditorProps<DataFields, Value>;

export const InflectionTableEditor = makeTableEditor<DataFields, Value>({
  CellData,
  CellEditor,
  ContextMenu,
  hasContextMenu: () => true,
  getCellDescription,
  commands,
  canEditStructure: true,
  canSelectMultiple: true,
  canEditCell: () => true,
});

InflectionTableEditor.displayName = 'InflectionTableEditor';
