import {ReactNode, useMemo} from 'react';

import {CommandSpecMap, CommandGroup} from '@condict/ui';

import TableEditor from '../table-editor';
import EditorContext from '../context';
import {NavigationCommands} from '../commands';
import useTableCommands from '../table-commands';
import {EditorContextValue} from '../types';

import CellEditor from './cell-editor';
import CellData from './cell-data';
import ContextMenu, {hasContextMenu} from './context-menu';
import DefinitionTableCommands from './commands';
import DefaultMessages from './messages';
import {describeCell} from './operations';
import StemsContext from './stems-context';
import {
  DefinitionTable,
  DefinitionTableData,
  DefinitionTableCommandFn,
  Messages,
} from './types';

export type Props = {
  value: DefinitionTable;
  term: string;
  stems: ReadonlyMap<string, string>;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  contextMenuExtra?: ReactNode;
  messages?: Messages;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onChange: (value: DefinitionTable) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

const AllCommands: CommandSpecMap<DefinitionTableCommandFn> = {
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

const DefinitionTableEditor = (props: Props): JSX.Element => {
  const {
    value,
    term,
    stems,
    messages = DefaultMessages,
    onChange,
    ...otherProps
  } = props;

  const commands = useTableCommands({value, onChange, commands: AllCommands});
  const stemsContext = useMemo(() => ({term, stems}), [term, stems]);

  return (
    <StemsContext.Provider value={stemsContext}>
      <EditorContext.Provider value={Context}>
        <TableEditor
          {...otherProps}
          table={value}
          messages={messages}
          commands={commands}
          onChange={onChange}
        />
      </EditorContext.Provider>
    </StemsContext.Provider>
  );
};

export default DefinitionTableEditor;

export type DefinitionTableCommandsOptions = {
  value: DefinitionTable;
  onChange: (value: DefinitionTable) => void;
  disabled?: boolean;
};

export const useDefinitionTableCommands = (
  options: DefinitionTableCommandsOptions
): CommandGroup => {
  return useTableCommands({
    ...options,
    commands: AllCommands,
  });
};
