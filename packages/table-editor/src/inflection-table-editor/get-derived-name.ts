import {LayoutCell} from '../value/types';

import Value from './value';

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
  value: Value,
  headerTexts: string[],
  startPos: number,
  getCell: (pos: number) => LayoutCell,
  canUseHeader: (pos: number, cell: LayoutCell) => boolean,
  decrement: (pos: number, cell: LayoutCell) => number
) => {
  let foundHeader = false;
  for (let pos = startPos; pos >= 0; ) {
    const candidateLayoutCell = getCell(pos);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const candidateCell = value.rows
      .get(candidateLayoutCell.row)!
      .cells
      .get(candidateLayoutCell.colIndex)!;

    if (candidateCell.header) {
      foundHeader = true;
      if (canUseHeader(pos, candidateLayoutCell)) {
        headerTexts.push(candidateCell.data.text);
      }
    } else if (foundHeader) {
      // We've already collected at least one header, and then encountered a
      // data cell, which means we're done locating headers!
      break;
    }

    pos = decrement(pos, candidateLayoutCell);
  }
};

export default (value: Value, key: string) => {
  const {layout} = value;
  const layoutCell = layout.cellFromKey(key);
  if (!layoutCell) {
    throw new Error(`Cell not found: ${key}`);
  }

  // We walk through the table "inside-out", starting at the selected cell.
  const nameParts: string[] = [];

  const lastColIndex = layoutCell.col + layoutCell.columnSpan - 1;
  // Column headers first
  collectNearbyHeaders(
    value,
    nameParts,
    layoutCell.row - 1,
    row => layout.cellFromPosition(row, layoutCell.col),
    (row, cell) =>
      layoutCell.columnSpan === 1 ||
      layout.cellFromPosition(row, lastColIndex) === cell,
    (row, cell) => row - cell.rowSpan
  );

  const lastRowIndex = layoutCell.row + layoutCell.rowSpan - 1;
  // Row headers second
  collectNearbyHeaders(
    value,
    nameParts,
    layoutCell.col - 1,
    col => layout.cellFromPosition(layoutCell.row, col),
    (col, cell) =>
      layoutCell.rowSpan === 1 ||
      layout.cellFromPosition(lastRowIndex, col) === cell,
    (col, cell) => col - cell.columnSpan
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
