import React, {useMemo, useCallback, useRef} from 'react';
import {useFormContext, useFieldArray, useWatch} from 'react-hook-form';
import {Localized, useLocalization} from '@fluent/react';
import AddIcon from 'mdi-react/PlusIcon';

import {Button, Menu, MenuTrigger, genUniqueId, useUniqueId} from '@condict/ui';
import {emptyTableCaption} from '@condict/rich-text-editor';

import {DefinitionTableValue, Field, Label} from '../../form-fields';
import {
  PartOfSpeechId,
  InflectionTableId,
  InflectedFormId,
} from '../../graphql';
import type {NewInflectionTable} from '../../panels';

import useTableReordering, {CurrentMovingState} from './table-reordering';
import Table from './table';
import {
  DefinitionTableId,
  DefinitionTableData,
  Stems,
  PartOfSpeechFields,
  InflectionTableInfo,
} from './types';
import * as S from './styles';

export type Props = {
  partsOfSpeech: readonly PartOfSpeechFields[];
  defaultTableData: Record<string, DefinitionTableData>;
  defaultStems: Stems;
  onCreateInflectionTable: (
    partOfSpeechId: PartOfSpeechId
  ) => Promise<NewInflectionTable | null>;
};

const EmptyCustomForms = new Map<InflectedFormId, string>();

const TableList = React.memo((props: Props): JSX.Element => {
  const {
    partsOfSpeech,
    defaultTableData,
    defaultStems,
    onCreateInflectionTable,
  } = props;

  const {l10n} = useLocalization();

  const id = useUniqueId();

  const form = useFormContext();

  const fieldArray = useFieldArray({
    name: 'inflectionTables.list',
    keyName: 'key',
  });
  const fields = fieldArray.fields as (DefinitionTableId & {key: string})[];
  const append = fieldArray.append as (value: DefinitionTableId) => void;
  const remove = fieldArray.remove as (index: number) => void;
  const move = fieldArray.move as (from: number, to: number) => void;

  // Default values for tables added since the component was mounted. Tables
  // that are in the form's default values are in the form's default values.
  const newTableDefaults = useRef<Record<string, DefinitionTableData>>({});

  const addTable = useCallback((table: DefinitionTableData) => {
    const id = genUniqueId();
    newTableDefaults.current[id] = table;
    form.setValue(`inflectionTables.data.${id}`, table);
    append({id});
  }, [append]);

  const {
    listRef,
    moving,
    onMove,
    onMoveDone,
    onDragStart,
  } = useTableReordering(move);

  const handleRemove = useCallback((index: number) => {
    const data = form.getValues('inflectionTables.list') as DefinitionTableId[];
    const id = data[index].id;
    delete newTableDefaults.current[id];
    remove(index);
    // The table data is removed when the corresponding <Table> unmounts.
  }, [remove]);

  const partOfSpeechId = useWatch({
    name: 'partOfSpeech',
  }) as PartOfSpeechId | null;

  const inflectionTableMap = useMemo(() => {
    const result = new Map<InflectionTableId, InflectionTableInfo>();
    for (const pos of partsOfSpeech) {
      for (const table of pos.inflectionTables) {
        result.set(table.id, {
          parent: pos.id,
          table,
        });
      }
    }
    return result;
  }, [partsOfSpeech]);

  const inflectionTableOptions = useMemo(() => {
    const pos =
      partOfSpeechId !== null &&
      partsOfSpeech.find(p => p.id === partOfSpeechId);
    if (!pos) {
      return [];
    }
    return pos.inflectionTables.map(t =>
      <Menu.Item
        key={t.id}
        label={t.name}
        onActivate={() => addTable({
          id: null,
          caption: emptyTableCaption(),
          table: DefinitionTableValue.fromGraphQLResponse(
            t.layout.rows,
            EmptyCustomForms
          ),
          tableId: t.id,
          layoutId: t.layout.id,
          upgraded: false,
        })}
      />
    );
  }, [partsOfSpeech, partOfSpeechId]);

  const stems = useWatch({
    name: 'stems',
    defaultValue: defaultStems,
  }) as Stems;

  const handleCreateInflectionTable = useCallback(() => {
    // The menu item only renders when partOfSpeechId is not null.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    void onCreateInflectionTable(partOfSpeechId!).then(table => {
      if (table) {
        // It's not really necessary to add the table to the table menu, as
        // it will refresh fairly soon anyway (hopefully).
        addTable({
          id: null,
          caption: emptyTableCaption(),
          table: DefinitionTableValue.fromGraphQLResponse(
            table.layout.rows,
            EmptyCustomForms
          ),
          tableId: table.id,
          layoutId: table.layout.id,
          upgraded: false,
        });
      }
    });
  }, [partOfSpeechId, addTable, onCreateInflectionTable]);

  return (
    <Field role='group' aria-labelledby={`${id}-label`}>
      <Label as='span' id={`${id}-label`}>
        <Localized id='definition-inflection-tables-label'/>
      </Label>
      <S.TableList ref={listRef}>
        {fields.map((field, index) =>
          <Table
            key={field.key}
            id={field.id}
            index={index}
            totalCount={fields.length}
            defaultValues={
              newTableDefaults.current[field.id] ??
              defaultTableData[field.id]
            }
            allTableMap={inflectionTableMap}
            partOfSpeechId={partOfSpeechId}
            stems={stems.map}
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
        {partOfSpeechId !== null ? (
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
        ) : (
          <Localized id='definition-tables-select-part-of-speech-helper'/>
        )}
      </S.ListTools>
    </Field>
  );
});

TableList.displayName = 'TableList';

export default TableList;
