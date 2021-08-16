import {useMemo} from 'react';
import {useLocalization} from '@fluent/react';

import {
  InflectionTableMessages,
  DefinitionTableMessages,
} from '@condict/table-editor';

export type TableEditorMessages =
  InflectionTableMessages &
  DefinitionTableMessages;

export const useTableEditorMessages = (): TableEditorMessages => {
  const {l10n} = useLocalization();
  return useMemo(() => ({
    // Common table editor messags.
    cellEditorSRHelper: () => l10n.getString('table-editor-save-cell-sr-helper'),
    cellEditorTitle: () => l10n.getString('table-editor-cell-editor-title'),
    cellValueLabel: () => l10n.getString('table-editor-cell-value-label'),
    describeSelection: sel => {
      const multiCol = sel.minColumn !== sel.maxColumn;
      const multiRow = sel.minRow !== sel.maxRow;
      if (multiCol && multiRow) {
        return l10n.getString('table-editor-selection-columns-rows', {
          totalCells: sel.cells.size,
          firstColumn: sel.minColumn + 1,
          lastColumn: sel.maxColumn + 1,
          firstRow: sel.minRow + 1,
          lastRow: sel.maxRow + 1,
        });
      }
      // This function is never called with only one selected cell, so exactly one
      // of multCol and multiRow is now true.
      if (multiCol) {
        return l10n.getString('table-editor-selection-columns-1-row', {
          totalCells: sel.cells.size,
          firstColumn: sel.minColumn + 1,
          lastColumn: sel.maxColumn + 1,
          row: sel.minRow + 1,
        });
      } else {
        return l10n.getString('table-editor-selection-1-column-rows', {
          totalCells: sel.cells.size,
          column: sel.minColumn + 1,
          firstRow: sel.minRow + 1,
          lastRow: sel.maxRow + 1,
        });
      }
    },

    // Inflection table editor messages.
    noDerivedLemma: () => l10n.getString('table-editor-not-derived-lemma'),
    hasCustomName: () => l10n.getString('table-editor-form-has-custom-name'),
    headerCellOption: () =>
      l10n.getString('table-editor-header-cell-option-label'),
    deriveLemmaOption: () =>
      l10n.getString('table-editor-derive-lemma-option-label'),
    formNameLabel: () => l10n.getString('table-editor-form-name-label'),
    useAutomaticNameButton: () =>
      l10n.getString('table-editor-use-automatic-name-button'),
    automaticNameHelper: () =>
      l10n.getString('table-editor-automatic-name-helper'),
    headerCellMenu: count =>
      l10n.getString('table-editor-header-cell-menu', {count}),
    deriveLemmaMenu: count =>
      l10n.getString('table-editor-derive-lemma-menu', {count}),
    mergeCells: () => l10n.getString('table-editor-merge-cells'),
    separateCells: () => l10n.getString('table-editor-separate-cells'),
    insertSubmenu: () => l10n.getString('table-editor-insert-submenu'),
    insertRowAbove: () => l10n.getString('table-editor-insert-row-above'),
    insertRowBelow: () => l10n.getString('table-editor-insert-row-below'),
    insertColumnBefore: () =>
      l10n.getString('table-editor-insert-column-before'),
    insertColumnAfter: () => l10n.getString('table-editor-insert-column-after'),
    deleteRows: count =>
      l10n.getString('table-editor-delete-rows', {count}),
    deleteColumns: count =>
      l10n.getString('table-editor-delete-columns', {count}),
    noDeriveLemmaIconTitle: () =>
      l10n.getString('table-editor-not-derive-lemma-icon-title'),
    hasCustomNameIconTitle: () =>
      l10n.getString('table-editor-form-has-custom-name-icon-title'),

    // Definition table editor messages.
    formIsInflected: () => l10n.getString('table-editor-form-is-inflected'),
    formIsDeleted: () => l10n.getString('table-editor-form-is-deleted'),
    customForm: () => l10n.getString('table-editor-custom-form'),
    cellDialogInputHelper: () =>
      l10n.getString('table-editor-cell-dialog-input-helper'),
    useDefaultFormButton: () =>
      l10n.getString('table-editor-use-default-form-button'),
    useDefaultFormMenu: () =>
      l10n.getString('table-editor-use-default-form-menu'),
    deleteThisForm: () => l10n.getString('table-editor-delete-form-menu'),
  }), [l10n]);
};
