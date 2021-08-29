import React, {useState, useMemo, useCallback, useEffect, useRef} from 'react';
import {useFieldArray, useWatch} from 'react-hook-form';
import {Localized, useLocalization} from '@fluent/react';
import produce from 'immer';
import AddIcon from 'mdi-react/PlusIcon';

import {Button, Menu, MenuTrigger, useUniqueId} from '@condict/ui';
import {emptyTableCaption} from '@condict/rich-text-editor';

import {DefinitionTableValue, Field, Label} from '../../form-fields';
import {
  PartOfSpeechId,
  InflectionTableId,
  InflectedFormId,
} from '../../graphql';
import type {NewInflectionTable} from '../../panels';

import Table from './table';
import {
  DefinitionData,
  Stems,
  PartOfSpeechFields,
  InflectionTableInfo,
  MovingState,
} from './types';
import * as S from './styles';

export type Props = {
  partsOfSpeech: readonly PartOfSpeechFields[];
  defaultStems: Stems;
  onCreateInflectionTable: (
    partOfSpeechId: PartOfSpeechId
  ) => Promise<NewInflectionTable | null>;
};

interface AllMovingState {
  readonly phase: 'moving' | 'done';
  readonly from: number;
  readonly to: number;
  readonly primary: MovingState;
  readonly other: MovingState;
}

const AllMovingState = {
  get(state: AllMovingState, index: number): MovingState | undefined {
    if (index === state.from) {
      return state.primary;
    }
    const inRange = state.from < state.to
      ? state.from <= index && index <= state.to
      : state.to <= index && index <= state.from;
    if (inRange) {
      return state.other;
    }
    return;
  },
} as const;

const EmptyCustomForms = new Map<InflectedFormId, string>();

const TableList = React.memo((props: Props): JSX.Element => {
  const {partsOfSpeech, defaultStems, onCreateInflectionTable} = props;

  const {l10n} = useLocalization();

  const id = useUniqueId();

  const {
    fields,
    append,
    remove,
    move,
  } = useFieldArray<DefinitionData, 'inflectionTables', 'key'>({
    name: 'inflectionTables',
    keyName: 'key',
  });

  const [moving, setMoving] = useState<AllMovingState | undefined>();

  const listRef = useRef<HTMLUListElement>(null);
  const handleMove = useCallback((from: number, to: number) => {
    if (moving || !listRef.current) {
      // Wait until we're done.
      return;
    }

    const list = listRef.current;
    const fromItem = list.children[from];
    const fromRect = fromItem.getBoundingClientRect();
    const toItem = list.children[to];
    const toRect = toItem.getBoundingClientRect();

    let primaryTarget: number;
    let otherTarget: number;
    if (from < to) {
      // Moving down: fromRect.bottom moves to toRect.bottom.
      primaryTarget = toRect.bottom - fromRect.bottom;
      otherTarget = -(fromRect.height + S.TableItemGap);
    } else {
      // Moving up: fromRect.top moves to toRect.top.
      primaryTarget = toRect.top - fromRect.top;
      otherTarget = fromRect.height + S.TableItemGap;
    }

    setMoving({
      phase: 'moving',
      from,
      to,
      primary: {
        target: primaryTarget,
        primary: true,
        animate: true,
      },
      other: {
        target: otherTarget,
        primary: false,
        animate: true,
      },
    });
  }, [moving]);

  const handleMoveDone = useCallback(() => {
    setMoving(produce(prev => {
      if (!prev) {
        return;
      }
      prev.phase = 'done';
      prev.primary.animate = false;
      prev.other.animate = false;
    }));
  }, []);

  useEffect(() => {
    if (moving && moving.phase === 'done') {
      const {from, to} = moving;
      void Promise.resolve().then(() => {
        setMoving(undefined);
        move(from, to);
      });
    }
  }, [move, moving]);

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
        onActivate={() => append({
          id: null,
          caption: emptyTableCaption(),
          table: DefinitionTableValue.fromGraphQLResponse(
            t.layout.rows,
            EmptyCustomForms
          ),
          tableId: t.id,
          layoutId: t.layout.id,
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
        // It's not really necessary to add the table to the table list, as
        // it will refresh fairly soon anyway (hopefully).
        append({
          id: null,
          caption: emptyTableCaption(),
          table: DefinitionTableValue.fromGraphQLResponse(
            table.layout.rows,
            EmptyCustomForms
          ),
          tableId: table.id,
          layoutId: table.layout.id,
        });
      }
    });
  }, [partOfSpeechId, onCreateInflectionTable]);

  return (
    <Field role='group' aria-labelledby={`${id}-label`}>
      <Label as='span' id={`${id}-label`}>
        <Localized id='definition-inflection-tables-label'/>
      </Label>
      <S.TableList ref={listRef}>
        {fields.map((field, index) =>
          <Table
            key={field.key}
            index={index}
            totalCount={fields.length}
            defaultValues={field}
            allTableMap={inflectionTableMap}
            partOfSpeechId={partOfSpeechId}
            stems={stems.map}
            moving={moving && AllMovingState.get(moving, index)}
            onMoveDone={
              moving && index === moving.from
                ? handleMoveDone
                : undefined
            }
            onMove={handleMove}
            onRemove={remove}
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
