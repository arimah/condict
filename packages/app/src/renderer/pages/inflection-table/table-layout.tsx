import React from 'react';

import {InflectionPattern} from '@condict/table-editor';

import {OperationResult} from '../../graphql';
import {Table} from '../../ui';

import InflectionTableQuery from './query';

export type Props = {
  layout: LayoutData;
};

type LayoutData = NonNullable<
  OperationResult<typeof InflectionTableQuery>['inflectionTable']
>['layout'];

const TableLayout = React.memo((props: Props): JSX.Element => {
  const {layout} = props;
  return (
    <Table>
      <tbody>
        {layout.rows.map((row, r) =>
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
                  title={cell.inflectedForm.displayName}
                >
                  <InflectionPattern
                    pattern={cell.inflectedForm.inflectionPattern || ' '}
                  />
                </td>
              )
            )}
          </tr>
        )}
      </tbody>
    </Table>
  );
});

TableLayout.displayName = 'TableLayout';

export default TableLayout;
