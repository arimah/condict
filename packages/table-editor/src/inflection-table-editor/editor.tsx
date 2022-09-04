import {ReactNode, useMemo} from 'react';

import {
  CommandSpecMap,
  CommandGroup,
  WritingDirection,
  useWritingDirection,
} from '@condict/ui';

import TableEditor from '../table-editor';
import EditorContext from '../context';
import {
  getMultiselectCommands,
  getNavigationCommands,
  StructureCommands,
} from '../commands';
import useTableCommands from '../table-commands';
import {EditorContextValue} from '../types';

import CellEditor from './cell-editor';
import CellData from './cell-data';
import ContextMenu from './context-menu';
import InflectionTableCommands from './commands';
import DefaultMessages from './messages';
import {describeCell} from './operations';
import {
  InflectionTable,
  InflectionTableData,
  InflectionTableCommandFn,
  Messages,
} from './types';

export type Props = {
  value: InflectionTable;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  contextMenuExtra?: ReactNode;
  messages?: Messages;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onChange: (value: InflectionTable) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

const getAllCommands = (
  dir: WritingDirection
): CommandSpecMap<InflectionTableCommandFn> => ({
  ...getNavigationCommands(dir),
  ...getMultiselectCommands(dir),
  ...StructureCommands,
  ...InflectionTableCommands,
});

const ExposedCommands: CommandSpecMap<InflectionTableCommandFn> = {
  ...StructureCommands,
  ...InflectionTableCommands,
};

const Context: EditorContextValue<InflectionTableData, Messages> = {
  CellEditor,
  CellData,
  ContextMenu,
  multiSelect: true,
  canEditCell: () => true,
  describeCell,
  hasContextMenu: () => true,
};

const InflectionTableEditor = (props: Props): JSX.Element => {
  const {
    value,
    messages = DefaultMessages,
    onChange,
    ...otherProps
  } = props;

  const dir = useWritingDirection();

  const commands = useMemo(() => getAllCommands(dir), [dir]);
  const commandGroup = useTableCommands({value, onChange, commands});

  return (
    <EditorContext.Provider value={Context}>
      <TableEditor
        {...otherProps}
        table={value}
        messages={messages}
        commands={commandGroup}
        onChange={onChange}
      />
    </EditorContext.Provider>
  );
};

export default InflectionTableEditor;

export type InflectionTableCommandsOptions = {
  value: InflectionTable;
  onChange: (value: InflectionTable) => void;
  disabled?: boolean;
};

export const useInflectionTableCommands = (
  options: InflectionTableCommandsOptions
): CommandGroup => {
  return useTableCommands({
    ...options,
    commands: ExposedCommands,
  });
};
