import DefaultEditorMessages from '../messages';

import {Messages} from './types';

const DefaultMessages: Messages = {
  ...DefaultEditorMessages,
  noDerivedLemma: () => 'No headword created from this form.',
  hasCustomName: () => 'Form has custom name.',
  headerCellOption: () => 'Header cell',
  deriveLemmaOption: () => 'Create headword from this form',
  formNameLabel: () => 'Name of this form:',
  useAutomaticNameButton: () => 'Use automatic name',
  automaticNameHelper: () =>
    'The name is calculated automatically. Type here to change it.',
  headerCellMenu: (n: number) =>
    n === 1 ? 'Header cell' : 'Header cells',
  deriveLemmaMenu: (n: number) =>
    n === 1 ? 'Create headword' : 'Create headwords',
  mergeCells: () => 'Merge cells',
  separateCells: () => 'Separate cells',
  insertSubmenu: () => 'Insert',
  insertRowAbove: () => 'Row above',
  insertRowBelow: () => 'Row below',
  insertColumnBefore: () => 'Column before',
  insertColumnAfter: () => 'Column after',
  deleteRows: (n: number) =>
    n === 1 ? 'Delete row' : `Delete ${n} rows`,
  deleteColumns: (n: number) =>
    n === 1 ? 'Delete column' : `Delete ${n} columns`,
  noDeriveLemmaIconTitle: () => 'Headword is not created from this form',
  hasCustomNameIconTitle: () => 'This form has a custom name',
};

export default DefaultMessages;
