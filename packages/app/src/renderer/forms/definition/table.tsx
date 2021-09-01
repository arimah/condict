import React, {TransitionEvent, useMemo, useRef} from 'react';
import {useWatch} from 'react-hook-form';
import {Localized, useLocalization} from '@fluent/react';
import MoveUpIcon from 'mdi-react/ArrowUpIcon';
import MoveDownIcon from 'mdi-react/ArrowDownIcon';
import RemoveIcon from 'mdi-react/TableRemoveIcon';
import ErrorIcon from 'mdi-react/AlertCircleIcon';
import TableUpgradeIcon from 'mdi-react/TableAlertIcon';
import TableWarningIcon from 'mdi-react/TableArrowUpIcon';

import {Toolbar} from '@condict/ui';

import {TableCaptionField, DefinitionTableField} from '../../form-fields';
import {PartOfSpeechId, InflectionTableLayoutId} from '../../graphql';

import {DefinitionTableData, InflectionTableMap, MovingState} from './types';
import * as S from './styles';

export type Props = {
  index: number;
  totalCount: number;
  defaultValues: DefinitionTableData;
  allTableMap: InflectionTableMap;
  partOfSpeechId: PartOfSpeechId | null;
  stems: Map<string, string>;
  moving?: MovingState;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onMoveDone?: () => void;
};

type TableStatus =
  | 'ok'
  | 'hasUpgrade'
  | 'needsUpgrade'
  | 'wrongPartOfSpeech'
  | 'deleted';

const StatusIcons = {
  hasUpgrade: <TableUpgradeIcon/>,
  needsUpgrade: <TableWarningIcon/>,
  wrongPartOfSpeech: <ErrorIcon/>,
  deleted: <ErrorIcon/>,
};

const StatusMessages = {
  hasUpgrade: 'definition-table-has-new-version-notice',
  needsUpgrade: 'definition-table-needs-new-version-error',
  wrongPartOfSpeech: 'definition-table-wrong-part-of-speech-error',
  deleted: 'definition-table-deleted-error',
};

const Table = React.memo((props: Props): JSX.Element => {
  const {
    index,
    totalCount,
    defaultValues,
    allTableMap,
    partOfSpeechId,
    stems,
    moving,
    onMove,
    onRemove,
    onMoveDone,
  } = props;
  const {
    id,
    caption,
    table,
    tableId,
    layoutId: defaultLayoutId,
  } = defaultValues;

  const {l10n} = useLocalization();

  const itemRef = useRef<HTMLLIElement>(null);
  const handleTransitionEnd = useMemo(() => {
    if (!onMoveDone) {
      return;
    }
    return (e: TransitionEvent) => {
      if (e.target === itemRef.current) {
        onMoveDone();
      }
    };
  }, [onMoveDone]);

  const term = useWatch({name: 'term'}) as string;
  const layoutId = useWatch({
    name: `inflectionTables.${index}.layoutId`,
    defaultValue: defaultLayoutId,
  }) as InflectionTableLayoutId;

  const tableInfo = allTableMap.get(tableId);

  let status: TableStatus;
  if (!tableInfo) {
    status = 'deleted';
  } else if (tableInfo.parent !== partOfSpeechId) {
    status = 'wrongPartOfSpeech';
  } else if (tableInfo.table.layout.id !== layoutId) {
    status = id === null ? 'needsUpgrade' : 'hasUpgrade';
  } else {
    status = 'ok';
  }

  const hasError =
    status === 'deleted' ||
    status === 'wrongPartOfSpeech' ||
    status === 'needsUpgrade';

  // TODO: Table upgrade functionality
  return (
    <S.TableItem
      aria-label={l10n.getString('definition-inflection-table-title', {
        index: index + 1,
        total: totalCount,
        name: tableInfo?.table.name ?? '',
      })}
      style={moving && {
        top: moving.target,
        zIndex: moving.primary ? 1 : 0,
      }}
      moving={moving?.animate}
      onTransitionEnd={handleTransitionEnd}
      ref={itemRef}
    >
      <TableToolbar
        index={index}
        isLast={index === totalCount - 1}
        tableName={tableInfo?.table.name}
        onMove={onMove}
        onRemove={onRemove}
      />

      <TableCaptionField
        name={`inflectionTables.${index}.caption`}
        label={<Localized id='definition-table-caption-label'/>}
        defaultValue={caption}
        readOnly={hasError}
      />
      <DefinitionTableField
        name={`inflectionTables.${index}.table`}
        defaultValue={table}
        term={term}
        stems={stems}
        disabled={hasError}
      />

      {status !== 'ok' &&
        <S.TableStatus error={hasError}>
          {StatusIcons[status]}
          <span>
            <Localized id={StatusMessages[status]}/>
          </span>
        </S.TableStatus>
      }
    </S.TableItem>
  );
});

Table.displayName = 'Table';

export default Table;

type TableToolbarProps = {
  index: number;
  isLast: boolean;
  tableName: string | undefined;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
};

const TableToolbar = React.memo((props: TableToolbarProps): JSX.Element => {
  const {index, isLast, tableName, onMove, onRemove} = props;

  const {l10n} = useLocalization();

  const isFirst = index === 0;

  return (
    <S.TableToolbar>
      <S.TableName>
        {tableName ?? <Localized id='definition-table-deleted-heading'/>}
      </S.TableName>
      {!(isFirst && isLast) && <>
        <Toolbar.Button
          label={l10n.getString('definition-table-move-up-button')}
          disabled={isFirst}
          onClick={() => onMove(index, index - 1)}
        >
          <MoveUpIcon/>
        </Toolbar.Button>
        <Toolbar.Button
          label={l10n.getString('definition-table-move-down-button')}
          disabled={isLast}
          onClick={() => onMove(index, index + 1)}
        >
          <MoveDownIcon/>
        </Toolbar.Button>
      </>}
      <Toolbar.Button
        label={l10n.getString('definition-table-remove-button')}
        onClick={() => onRemove(index)}
      >
        <RemoveIcon/>
      </Toolbar.Button>
    </S.TableToolbar>
  );
});

TableToolbar.displayName = 'TableToolbar';
