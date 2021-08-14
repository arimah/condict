import React, {MouseEvent, useCallback} from 'react';
import {useLocalization} from '@fluent/react';
import UndoIcon from 'mdi-react/UndoIcon';
import RedoIcon from 'mdi-react/RedoIcon';
import InsertRowAboveIcon from 'mdi-react/TableRowPlusBeforeIcon';
import InsertRowBelowIcon from 'mdi-react/TableRowPlusAfterIcon';
import DeleteRowIcon from 'mdi-react/TableRowRemoveIcon';
import InsertColumnBeforeIcon from 'mdi-react/TableColumnPlusBeforeIcon';
import InsertColumnAfterIcon from 'mdi-react/TableColumnPlusAfterIcon';
import DeleteColumnIcon from 'mdi-react/TableColumnRemoveIcon';
import MergeIcon from 'mdi-react/TableMergeCellsIcon';
import SeparateIcon from 'mdi-react/TableSplitCellIcon';
import DotsIcon from 'mdi-react/DotsVerticalIcon';

import {Toolbar, Menu} from '@condict/ui';
import {SelectionShape} from '@condict/table-editor';

import {useOpenPanel} from '../../../navigation';
import {InflectionTableId, LanguageId, PartOfSpeechId} from '../../../graphql';

import * as S from '../styles';

import importLayoutPanel from './import-layout-panel';
import {InflectionTableValue} from './types';

type Props = {
  selection: SelectionShape;
  canUndo: boolean;
  canRedo: boolean;
  languageId: LanguageId;
  partOfSpeechId: PartOfSpeechId;
  inflectionTableId: InflectionTableId | null;
  onImportLayout: (layout: InflectionTableValue) => void;
};

const preventDefault = (e: MouseEvent) => {
  e.preventDefault();
};

const TableToolbar = React.memo((props: Props): JSX.Element => {
  const {
    selection,
    canUndo,
    canRedo,
    languageId,
    partOfSpeechId,
    inflectionTableId,
    onImportLayout,
  } = props;
  const {l10n} = useLocalization();

  const openPanel = useOpenPanel();
  const handleImportLayout = useCallback(() => {
    void openPanel(importLayoutPanel({
      languageId,
      partOfSpeechId,
      inflectionTableId,
    })).then(value => {
      if (value) {
        onImportLayout(value);
      }
    });
  }, [
    languageId,
    partOfSpeechId,
    inflectionTableId,
    openPanel,
    onImportLayout,
  ]);

  const colCount = selection.maxColumn - selection.minColumn + 1;
  const rowCount = selection.maxRow - selection.minRow + 1;
  return (
    <S.TableToolbar onMouseDown={preventDefault}>
      <Toolbar.Group>
        <Toolbar.Button
          command='undo'
          disabled={!canUndo}
          label={l10n.getString('generic-undo-button')}
        >
          <UndoIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='redo'
          disabled={!canRedo}
          label={l10n.getString('generic-redo-button')}
        >
          <RedoIcon/>
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group>
        <Toolbar.Button
          command='insertRowAbove'
          label={l10n.getString('table-editor-insert-row-above-button')}
        >
          <InsertRowAboveIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='insertRowBelow'
          label={l10n.getString('table-editor-insert-row-below-button')}
        >
          <InsertRowBelowIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='deleteSelectedRows'
          label={l10n.getString('table-editor-delete-rows', {
            count: rowCount,
          })}
        >
          <DeleteRowIcon/>
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group>
        <Toolbar.Button
          command='insertColumnBefore'
          label={l10n.getString('table-editor-insert-column-before-button')}
        >
          <InsertColumnBeforeIcon className='rtl-mirror'/>
        </Toolbar.Button>
        <Toolbar.Button
          command='insertColumnAfter'
          label={l10n.getString('table-editor-insert-column-after-button')}
        >
          <InsertColumnAfterIcon className='rtl-mirror'/>
        </Toolbar.Button>
        <Toolbar.Button
          command='deleteSelectedColumns'
          label={l10n.getString('table-editor-delete-columns', {
            count: colCount,
          })}
        >
          <DeleteColumnIcon/>
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group>
        <Toolbar.Button
          command='mergeSelection'
          label={l10n.getString('table-editor-merge-cells')}
        >
          <MergeIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='separateSelection'
          label={l10n.getString('table-editor-separate-cells')}
        >
          <SeparateIcon/>
        </Toolbar.Button>
      </Toolbar.Group>

      <Toolbar.Spacer/>

      <Toolbar.MenuButton
        label={l10n.getString('table-editor-tools-menu')}
        menu={
          <Menu placement='BELOW_RIGHT'>
            <Menu.Item
              label={l10n.getString('table-editor-import-layout-menu')}
              onActivate={handleImportLayout}
            />
          </Menu>
        }
      >
        <DotsIcon/>
      </Toolbar.MenuButton>
    </S.TableToolbar>
  );
});

TableToolbar.displayName = 'TableToolbar';

export default TableToolbar;
