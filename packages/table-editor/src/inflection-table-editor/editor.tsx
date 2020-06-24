import React, {ReactNode} from 'react';

import {CommandSpecMap} from '@condict/ui';

import TableEditor from '../table-editor';
import EditorContext from '../context';
import {
  MultiselectCommands,
  NavigationCommands,
  StructureCommands,
} from '../commands';
import TableCommands, {
  Props as TableCommandsProps,
  CommandsElement,
} from '../table-commands';
import {EditorContextValue} from '../types';

import CellEditor from './cell-editor';
import CellData from './cell-data';
import ContextMenu from './context-menu';
import InflectionTableCommands from './commands';
import DefaultMessages from './messages';
import {describeCell} from './operations';
import {InflectionTable, InflectionTableData, Messages} from './types';

const AllCommands: CommandSpecMap = {
  ...NavigationCommands,
  ...MultiselectCommands,
  ...StructureCommands,
  ...InflectionTableCommands,
};

const ExposedCommands: CommandSpecMap = {
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

export type CommandsProps<E extends CommandsElement> = TableCommandsProps<
  InflectionTableData,
  E
>;

const Commands = <E extends CommandsElement = 'div'>(
  props: CommandsProps<E> & { as?: E }
): JSX.Element =>
  <TableCommands<InflectionTableData, E>
    {...props}
    commands={ExposedCommands}
  />;

export type Props = {
  value: InflectionTable;
  className?: string;
  disabled?: boolean;
  contextMenuExtra?: ReactNode;
  messages?: Messages;
  onChange: (value: InflectionTable) => void;
};

const InflectionTableEditor = Object.assign(
  (props: Props): JSX.Element => {
    const {
      value,
      className,
      disabled = false,
      contextMenuExtra,
      messages = DefaultMessages,
      onChange,
    } = props;

    return (
      <EditorContext.Provider value={Context}>
        <TableEditor
          table={value}
          className={className}
          disabled={disabled}
          contextMenuExtra={contextMenuExtra}
          messages={messages}
          commands={AllCommands}
          onChange={onChange}
        />
      </EditorContext.Provider>
    );
  },
  {
    Commands,
  }
);

export default InflectionTableEditor;
