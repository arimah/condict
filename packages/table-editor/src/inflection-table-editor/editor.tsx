import React, {ReactNode} from 'react';

import {CommandSpecMap, CommandGroup} from '@condict/ui';

import TableEditor from '../table-editor';
import EditorContext from '../context';
import {
  MultiselectCommands,
  NavigationCommands,
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

const AllCommands: CommandSpecMap<InflectionTableCommandFn> = {
  ...NavigationCommands,
  ...MultiselectCommands,
  ...StructureCommands,
  ...InflectionTableCommands,
};

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

export type Props = {
  value: InflectionTable;
  className?: string;
  disabled?: boolean;
  contextMenuExtra?: ReactNode;
  messages?: Messages;
  onChange: (value: InflectionTable) => void;
};

const InflectionTableEditor = (props: Props): JSX.Element => {
  const {
    value,
    className,
    disabled = false,
    contextMenuExtra,
    messages = DefaultMessages,
    onChange,
  } = props;

  const commands = useTableCommands({value, onChange, commands: AllCommands});

  return (
    <EditorContext.Provider value={Context}>
      <TableEditor
        table={value}
        className={className}
        disabled={disabled}
        contextMenuExtra={contextMenuExtra}
        messages={messages}
        commands={commands}
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
