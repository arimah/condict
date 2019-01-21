export default ({selection}) => {
  if (selection.size > 1) {
    const rowSelection = selection.minRow !== selection.maxRow
      ? `row ${selection.minRow + 1} through ${selection.maxRow + 1}`
      : `row ${selection.minRow + 1}`;
    const colSelection = selection.minCol !== selection.maxCol
      ? `column ${selection.minCol + 1} through ${selection.maxCol + 1}`
      : `column ${selection.minCol + 1}`;
    return `${selection.size} cells selected: ${rowSelection}, ${colSelection}. `;
  } else {
    return '';
  }
};
