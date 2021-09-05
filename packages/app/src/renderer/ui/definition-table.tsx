import React, {ReactNode, useMemo} from 'react';
import {useLocalization} from '@fluent/react';

import {StemMap, inflectWord} from '@condict/inflect';

import {InflectedFormId} from '../graphql';

import {RichText, TextFields} from './rich-text';
import * as S from './styles';

export type Props = {
  layout: readonly DefinitionTableRow[];
  caption?: readonly TextFields[] | null;
  term: string;
  stems: StemMap;
  customForms: readonly CustomForm[];
};

export interface DefinitionTableRow {
  cells: readonly DefinitionTableCell[];
}

export type DefinitionTableCell =
  | DefinitionTableHeaderCell
  | DefinitionTableDataCell;

export interface DefinitionTableHeaderCell {
  readonly columnSpan: number;
  readonly rowSpan: number;
  readonly headerText: string;
}

export interface DefinitionTableDataCell {
  readonly columnSpan: number;
  readonly rowSpan: number;
  readonly inflectedForm: {
    readonly id: InflectedFormId;
    readonly inflectionPattern: string;
  };
}

export interface CustomForm {
  readonly inflectedForm: {
    readonly id: InflectedFormId;
  };
  readonly value: string;
}

const DefinitionTable = React.memo((props: Props): JSX.Element => {
  const {layout, caption, term, stems, customForms} = props;

  const {l10n} = useLocalization();
  const deletedFormTitle = l10n.getString('definition-table-deleted-form');

  const customFormMap = useMemo(() => new Map(
    customForms.map(f => [f.inflectedForm.id, f.value])
  ), [customForms]);

  return (
    <S.Table>
      {caption &&
        <caption>
          <RichText value={caption}/>
        </caption>}
      <tbody>
        {layout.map((row, r) =>
          <tr key={r}>
            {row.cells.map((cell, c) =>
              'headerText' in cell ? (
                <th key={c} colSpan={cell.columnSpan} rowSpan={cell.rowSpan}>
                  {cell.headerText || ' '}
                </th>
              ) : (
                <td
                  key={c}
                  colSpan={cell.columnSpan}
                  rowSpan={cell.rowSpan}
                  title={
                    customFormMap.get(cell.inflectedForm.id) === ''
                      ? deletedFormTitle
                      : undefined
                  }
                >
                  {renderInflectedForm(
                    customFormMap.get(cell.inflectedForm.id),
                    cell.inflectedForm.inflectionPattern,
                    term,
                    stems
                  )}
                </td>
              )
            )}
          </tr>
        )}
      </tbody>
    </S.Table>
  );
});

DefinitionTable.displayName = 'DefinitionTable';

export default DefinitionTable;

const renderInflectedForm = (
  customForm: string | undefined,
  inflectionPattern: string,
  term: string,
  stems: StemMap
): ReactNode => {
  if (customForm != null) {
    if (customForm === '') {
      // Deleted custom form
      return <S.DeletedForm/>;
    }
    return customForm;
  }

  const inflected = inflectWord(inflectionPattern, term, stems);
  // Render a space if empty, to prevent the cell from collapsing.
  return inflected || ' ';
};
