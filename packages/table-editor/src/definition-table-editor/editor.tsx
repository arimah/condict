import React, {ReactNode, useMemo} from 'react';

import {CommandSpecMap} from '@condict/ui';

import TableEditor from '../table-editor';
import EditorContext from '../context';
import {NavigationCommands} from '../commands';
import TableCommands, {
  Props as TableCommandsProps,
  CommandsElement,
} from '../table-commands';
import {EditorContextValue} from '../types';

import CellEditor from './cell-editor';
import CellData from './cell-data';
import ContextMenu, {hasContextMenu} from './context-menu';
import DefinitionTableCommands from './commands';
import DefaultMessages from './messages';
import {describeCell} from './operations';
import StemsContext from './stems-context';
import {DefinitionTable, DefinitionTableData, Messages} from './types';

const AllCommands: CommandSpecMap = {
  ...NavigationCommands,
  ...DefinitionTableCommands,
};

const Context: EditorContextValue<DefinitionTableData, Messages> = {
  CellEditor,
  CellData,
  ContextMenu,
  multiSelect: false,
  canEditCell: cell => !cell.header,
  describeCell,
  hasContextMenu,
};

export type CommandsProps<E extends CommandsElement> = TableCommandsProps<
  DefinitionTableData,
  E
>;

const Commands = <E extends CommandsElement = 'div'>(
  props: CommandsProps<E> & { as?: E }
): JSX.Element =>
  <TableCommands<DefinitionTableData, E>
    {...props}
    commands={DefinitionTableCommands}
  />;

export type Props = {
  value: DefinitionTable;
  term: string;
  stems: ReadonlyMap<string, string>;
  className?: string;
  disabled?: boolean;
  contextMenuExtra?: ReactNode;
  messages?: Messages;
  onChange: (value: DefinitionTable) => void;
};

const DefinitionTableEditor = Object.assign(
  (props: Props): JSX.Element => {
    const {
      value,
      term,
      stems,
      className,
      disabled = false,
      contextMenuExtra,
      messages = DefaultMessages,
      onChange,
    } = props;

    const stemsContext = useMemo(() => ({term, stems}), [term, stems]);

    return (
      <StemsContext.Provider value={stemsContext}>
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
      </StemsContext.Provider>
    );
  },
  {
    Commands,
  }
);

export default DefinitionTableEditor;
