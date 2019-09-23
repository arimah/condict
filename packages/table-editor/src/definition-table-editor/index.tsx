import React, {useMemo} from 'react';
import {Map} from 'immutable';

import makeTableEditor, {Props as EditorProps} from '../table-editor';

import Value from './value';
import CellData from './cell-data';
import CellEditor from './cell-editor';
import commands from './commands';
import getCellDescription from './get-cell-description';
import StemsContext, {StemsContextValue} from './stems-context';
import ContextMenu, {hasContextMenu} from './context-menu';
import DefaultMessages from './messages';
import {Messages} from './types';

export {Value as DefinitionTableValue};

const DefinitionTableEditorInner = makeTableEditor({
  CellData,
  CellEditor,
  ContextMenu,
  DefaultMessages,
  hasContextMenu,
  getCellDescription,
  commands,
  canEditStructure: false,
  canSelectMultiple: false,
  canEditCell: cell => !cell.header,
});

const getStems = (
  term: string,
  stems: Map<string, string>
): StemsContextValue => ({term, stems});

export type Props = {
  term?: string;
  stems?: Map<string, string>;
} & EditorProps<Value, Messages>;

export const DefinitionTableEditor = Object.assign(
  (props: Props) => {
    const {
      term = '',
      stems = Map<string, string>(),
      ...editorProps
    } = props;

    const contextValue = useMemo(
      () => getStems(term, stems),
      [term, stems]
    );

    return (
      <StemsContext.Provider value={contextValue}>
        <DefinitionTableEditorInner {...editorProps}/>
      </StemsContext.Provider>
    );
  },
  {
    Commands: DefinitionTableEditorInner.Commands,
  }
);
