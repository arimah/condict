import {Table, Layout, LayoutCell} from '../../value';

import {InflectionTable} from '../types';

// The display name is derived from the cell's nearest headers. First row
// headers, in left-to-right order, then column headers, in top-to-bottom
// order. Given a table like this:
//
//   +-------------------------+----------------------+--------+
//   |                         | Singular             |        |
//   |                         +-----------+----------+ Plural |
//   |                         | Masculine | Feminine |        |
//   +------------+------------+-----------+----------+--------+
//   |            | Nominative | A         | B        | C      |
//   | Indefinite +------------+-----------+----------+--------+
//   |            | Accusative | D         | E        | F      |
//   +------------+------------+-----------+----------+--------+
//
// where A through F are the only non-header cells, the display name of each
// cell would be, respectively:
//
//   - A: Indefinite nominative singular masculine
//   - B: Indefinite nominative singular feminine
//   - C: Indefinite nominative plural
//   - D: Indefinite accusative singular masculine
//   - E: Indefinite accusative singular feminine
//   - F: Indefinite accusative plural
//
// If a data cell spans multiple rows or columns, we only consider headers
// that span over all of the data cell's rows/columns. Given a table like this:
//
//   +----------+----------+------------+
//   |          | Ergative | Absolutive |
//   +----------+----------+------------+
//   | Singular | A        |            |
//   +----------+----------+ C          |
//   | Plural   | B        |            |
//   +----------+----------+------------+
//
// Form A will be named "Singular ergative", B will be "Plural ergative", and
// C will just be "Absolutive".
//
// Finally, we only consider consecutive header cells up to the nearest data
// cell. What this means is that in this table:
//
//   +---------+---+---------+---+
//   | Header1 | A | Header2 | B |
//   +---------+---+---------+---+
//
// the cells A and B would be named "Header1" and "Header2", respectively.
// Since there is a data cell between Header2 and Header1, B does *not*
// receive the name "Header1 Header2".
//
// This design will not work for all languages and all table structures, but
// for common uses, it should be Good Enough. And the user can edit the name
// later if they want, anyway.

const collectNearbyHeaders = (
  table: InflectionTable,
  headerTexts: string[],
  startPos: number,
  getCell: (pos: number) => LayoutCell,
  getHeaderText: (pos: number, cell: LayoutCell) => string | null,
  decrement: (pos: number, cell: LayoutCell) => number
) => {
  let foundHeader = false;
  for (let pos = startPos; pos >= 0; ) {
    const candidateLayoutCell = getCell(pos);

    const candidateCell = Table.getCell(table, candidateLayoutCell.key);

    if (candidateCell.header) {
      foundHeader = true;
      const text = getHeaderText(pos, candidateLayoutCell);
      if (text) {
        headerTexts.push(text);
      }
    } else if (foundHeader) {
      // We've already collected at least one header, and then encountered a
      // data cell, which means we're done locating headers!
      break;
    }

    pos = decrement(pos, candidateLayoutCell);
  }
};

const getDerivedName = (table: InflectionTable, key: string): string => {
  const {layout} = table;
  const layoutCell = Layout.getCellByKey(layout, key);

  // We walk through the table "inside-out", starting at the selected cell.
  const nameParts: string[] = [];

  const lastColumnIndex = layoutCell.homeColumn + layoutCell.columnSpan - 1;
  // Column headers first
  collectNearbyHeaders(
    table,
    nameParts,
    layoutCell.homeRow - 1,
    row => Layout.getCellAt(layout, row, layoutCell.homeColumn),
    (row, cell) => {
      if (
        layoutCell.columnSpan === 1 ||
        Layout.getCellAt(layout, row, lastColumnIndex) === cell
      ) {
        return Table.getData(table, cell.key).text;
      }
      // The selected cell spans more than one column and the candidate cell
      // does not completely span over it.
      return null;
    },
    (row, cell) => row - cell.rowSpan
  );

  const lastRowIndex = layoutCell.homeRow + layoutCell.rowSpan - 1;
  // Row headers second
  collectNearbyHeaders(
    table,
    nameParts,
    layoutCell.homeColumn - 1,
    column => Layout.getCellAt(layout, layoutCell.homeRow, column),
    (column, cell) => {
      if (
        layoutCell.rowSpan === 1 ||
        Layout.getCellAt(layout, lastRowIndex, column) === cell
      ) {
        return Table.getData(table, cell.key).text;
      }
      // The selected cell spans more than one row and the candidate cell
      // does not completely span over it.
      return null;
    },
    (column, cell) => column - cell.columnSpan
  );

  // We collected name parts in reverse, so let's rotate the board.
  nameParts.reverse();

  const displayName = nameParts
    // Strip extraneous spaces
    .map(p => p.trim())
    // Remove empty entries
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (displayName) {
    // Kinda gross
    return displayName[0].toUpperCase() + displayName.substr(1);
  } else {
    // Unlikely case: no header cells at all
    return 'Inflected form';
  }
};

export default getDerivedName;
