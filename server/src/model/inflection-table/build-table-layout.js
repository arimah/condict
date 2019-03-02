const {UserInputError} = require('apollo-server');

// Collects stem names that are present in an inflection pattern.
// `stems` is a Set that is added to by this function.
const collectStemNames = (pattern, stems) => {
  // Group 1: '{{' and '}}' (escape; ignored)
  // Group 2: The stem name, enclosed in curly brackets.
  const stemRegex = /(\{\{|\}\})|\{([^{}]+)\}/g;
  let m;
  while ((m = stemRegex.exec(pattern)) !== null) {
    // ~ is a special stem that always refers to the lemma.
    if (m[2] && m[2] !== '~') {
      stems.add(m[2]);
    }
  }
};

module.exports = async (layout, handleInflectedForm) => {
  const finalLayout = [];
  const stems = new Set();

  // I would love to use .map() here, but it's not really compatible with
  // async/await, and I can't be bothered to hand-roll my own .mapAsync().
  for (const row of layout) {
    const cells = [];

    for (const cell of row.cells) {
      const layoutCell = {};

      // It's rare for cells to span more than one column or row, so only
      // store the column and row span if necessary. Defaults to 1 otherwise.
      if (cell.columnSpan > 1) {
        layoutCell.columnSpan = cell.columnSpan;
      }
      if (cell.rowSpan > 1) {
        layoutCell.rowSpan = cell.rowSpan;
      }

      if (cell.headerText != null) {
        layoutCell.headerText = cell.headerText.trim();
      } else if (cell.inflectedForm != null) {
        // This is a data cell! Let handleInflectedForm() deal with it.
        // We expect it to return the inflected form ID.
        // All we do here is collect stem names, like `{Plural root}`,
        // inside the inflection pattern.
        collectStemNames(cell.inflectedForm.inflectionPattern, stems);
        layoutCell.inflectedFormId = await handleInflectedForm(
          cell.inflectedForm
        );
      } else {
        throw new UserInputError(
          `Cell must have either 'headerText' or 'inflectedForm'`
        );
      }

      cells.push(layoutCell);
    }

    finalLayout.push({cells});
  }

  return {finalLayout, stems: Array.from(stems)};
};
