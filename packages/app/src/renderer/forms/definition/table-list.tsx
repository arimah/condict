import React, {useMemo, useCallback} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import AddIcon from 'mdi-react/PlusIcon';
import {Draft} from 'immer';

import {Button, Menu, MenuTrigger, genUniqueId, useUniqueId} from '@condict/ui';
import {emptyTableCaption} from '@condict/rich-text-editor';
import {DefinitionTable} from '@condict/table-editor';

import {useNearestForm, useField, useFormValue} from '../../form';
import {Field, Label} from '../../form-fields';
import {InflectionTableId, InflectedFormId} from '../../graphql';
import type {NewInflectionTable} from '../../panels';

import useTableReordering, {CurrentMovingState} from './table-reordering';
import Table from './table';
import {DefinitionTableFormData, InflectionTableFields} from './types';
import * as S from './styles';

export type Props = {
  inflectionTables: readonly InflectionTableFields[];
  onCreateInflectionTable: () => Promise<NewInflectionTable | null>;
};

const EmptyCustomForms = new Map<InflectedFormId, string>();

const TableList = React.memo((props: Props): JSX.Element => {
  const {inflectionTables, onCreateInflectionTable} = props;

  const {l10n} = useLocalization();

  const id = useUniqueId();

  const form = useNearestForm();

  const field = useField<readonly DefinitionTableFormData[]>(
    form,
    'inflectionTables'
  );

  const addTable = useCallback((table: DefinitionTableFormData) => {
    field.update(tables => {
      tables.push(table as Draft<DefinitionTableFormData>);
    });
  }, []);

  const moveTable = useCallback((from: number, to: number) => {
    field.update(draft => {
      const table = draft[from];
      draft.splice(from, 1);
      draft.splice(to, 0, table);
    });
  }, []);

  const {
    listRef,
    moving,
    onMove,
    onMoveDone,
    onDragStart,
  } = useTableReordering(moveTable);

  const handleRemove = useCallback((index: number) => {
    field.update(draft => {
      draft.splice(index, 1);
    });
  }, []);

  const inflectionTableMap = useMemo(() => {
    const result = new Map<InflectionTableId, InflectionTableFields>();
    for (const table of inflectionTables) {
      result.set(table.id, table);
    }
    return result;
  }, [inflectionTables]);

  const inflectionTableOptions = useMemo(() => inflectionTables.map(t =>
    <Menu.Item
      key={t.id}
      label={t.name}
      onActivate={() => addTable({
        key: genUniqueId(),
        id: null,
        caption: emptyTableCaption(),
        table: DefinitionTable.fromJson(
          t.layout.rows,
          EmptyCustomForms
        ),
        tableId: t.id,
        layoutId: t.layout.id,
        stems: t.layout.stems,
        upgraded: false,
      })}
    />
  ), [inflectionTables]);

  const stems = useFormValue<Map<string, string>>(form, 'stems');

  const handleCreateInflectionTable = useCallback(() => {
    void onCreateInflectionTable().then(table => {
      if (table) {
        // It's not really necessary to add the table to the table menu, as
        // it will refresh fairly soon anyway (hopefully).
        addTable({
          key: genUniqueId(),
          id: null,
          caption: emptyTableCaption(),
          table: DefinitionTable.fromJson(
            table.layout.rows,
            EmptyCustomForms
          ),
          tableId: table.id,
          layoutId: table.layout.id,
          stems: table.layout.stems,
          upgraded: false,
        });
      }
    });
  }, [addTable, onCreateInflectionTable]);

  const tables = field.value;
  return (
    <Field role='group' aria-labelledby={`${id}-label`}>
      <Label as='span' id={`${id}-label`}>
        <Localized id='definition-inflection-tables-label'/>
      </Label>
      <S.TableList ref={listRef}>
        {tables.map((table, index) =>
          <Table
            key={table.key}
            id={table.key}
            index={index}
            totalCount={tables.length}
            allTableMap={inflectionTableMap}
            stems={stems}
            moving={moving && CurrentMovingState.get(moving, index)}
            onMove={onMove}
            onDragStart={onDragStart}
            onRemove={handleRemove}
            onMoveDone={
              moving && index === moving.from
                ? onMoveDone
                : undefined
            }
          />
        )}
      </S.TableList>
      <S.ListTools>
        <MenuTrigger
          menu={
            <Menu>
              {inflectionTableOptions}
              {inflectionTableOptions.length > 0 && <Menu.Separator/>}
              <Menu.Item
                label={l10n.getString('definition-new-table-menu')}
                onActivate={handleCreateInflectionTable}
              />
            </Menu>
          }
          openClass='force-active'
        >
          <Button>
            <AddIcon/>
            <span>
              <Localized id='definition-add-table-button'/>
            </span>
          </Button>
        </MenuTrigger>
      </S.ListTools>
    </Field>
  );
});

TableList.displayName = 'TableList';

export default TableList;
