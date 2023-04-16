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
import ImportIcon from 'mdi-react/TableArrowDownIcon';
import TransposeIcon from 'mdi-react/TablePivotIcon';
import RenameFormsIcon from 'mdi-react/FormTextboxIcon';

import {Toolbar, Menu} from '@condict/ui';
import {InflectionTable, SelectionShape} from '@condict/table-editor';

import {useOpenPanel} from '../../navigation';
import {InflectionTableId, LanguageId} from '../../graphql';

import * as S from '../styles';

import importLayoutPanel from './import-layout-panel';
import renameFormsPanel from './rename-forms-panel';
import transposeTable from './transpose-table';

type Props = {
  selection: SelectionShape;
  canUndo: boolean;
  canRedo: boolean;
  valueRef: { current: InflectionTable };
  languageId: LanguageId;
  inflectionTableId: InflectionTableId | null;
  onChange: (table: InflectionTable) => void;
};

const preventDefault = (e: MouseEvent) => {
  e.preventDefault();
};

const TableToolbar = React.memo((props: Props): JSX.Element => {
  const {
    selection,
    canUndo,
    canRedo,
    valueRef,
    languageId,
    inflectionTableId,
    onChange,
  } = props;
  const {l10n} = useLocalization();

  const openPanel = useOpenPanel();

  const handleRenameForms = useCallback(() => {
    const table = valueRef.current;
    void openPanel(renameFormsPanel(table)).then(value => {
      if (value) {
        onChange(value);
      }
    });
  }, [openPanel, onChange]);

  const handleImportLayout = useCallback(() => {
    void openPanel(importLayoutPanel({
      languageId,
      inflectionTableId,
    })).then(value => {
      if (value) {
        onChange(value);
      }
    });
  }, [
    languageId,
    inflectionTableId,
    openPanel,
    onChange,
  ]);

  const handleTranspose = useCallback(() => {
    onChange(transposeTable(valueRef.current));
  }, [onChange]);

  const colCount = selection.maxColumn - selection.minColumn + 1;
  const rowCount = selection.maxRow - selection.minRow + 1;
  return (
    <S.TableToolbar onMouseDown={preventDefault}>
      <Toolbar.Group>
        <Toolbar.Button
          command='undo'
          disabled={!canUndo}
          title={l10n.getString('generic-undo-button')}
        >
          <UndoIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='redo'
          disabled={!canRedo}
          title={l10n.getString('generic-redo-button')}
        >
          <RedoIcon/>
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group>
        <Toolbar.Button
          command='insertRowAbove'
          title={l10n.getString('table-editor-insert-row-above-button')}
        >
          <InsertRowAboveIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='insertRowBelow'
          title={l10n.getString('table-editor-insert-row-below-button')}
        >
          <InsertRowBelowIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='deleteSelectedRows'
          title={l10n.getString('table-editor-delete-rows', {
            count: rowCount,
          })}
        >
          <DeleteRowIcon/>
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group>
        <Toolbar.Button
          command='insertColumnBefore'
          title={l10n.getString('table-editor-insert-column-before-button')}
        >
          <InsertColumnBeforeIcon className='rtl-mirror'/>
        </Toolbar.Button>
        <Toolbar.Button
          command='insertColumnAfter'
          title={l10n.getString('table-editor-insert-column-after-button')}
        >
          <InsertColumnAfterIcon className='rtl-mirror'/>
        </Toolbar.Button>
        <Toolbar.Button
          command='deleteSelectedColumns'
          title={l10n.getString('table-editor-delete-columns', {
            count: colCount,
          })}
        >
          <DeleteColumnIcon/>
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group>
        <Toolbar.Button
          command='mergeSelection'
          title={l10n.getString('table-editor-merge-cells')}
        >
          <MergeIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          command='separateSelection'
          title={l10n.getString('table-editor-separate-cells')}
        >
          <SeparateIcon/>
        </Toolbar.Button>
      </Toolbar.Group>

      <Toolbar.Spacer/>

      <Toolbar.MenuButton
        title={l10n.getString('table-editor-tools-menu')}
        menu={
          <Menu>
            <Menu.Item
              label={l10n.getString('table-editor-transpose-menu')}
              icon={<TransposeIcon/>}
              onActivate={handleTranspose}
            />
            <Menu.Item
              label={l10n.getString('table-editor-rename-forms')}
              icon={<RenameFormsIcon/>}
              onActivate={handleRenameForms}
            />
            <Menu.Separator/>
            <Menu.Item
              label={l10n.getString('table-editor-import-layout-menu')}
              icon={<ImportIcon/>}
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
