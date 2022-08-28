import {
  Shade,
  ThemeVariables,
  Gray,
  Purple,
  Teal,
} from '@condict/ui';

export const lightThemeVars = (accent: Shade): ThemeVariables => ({
  'table-fg': 'var(--fg)',
  'table-fg-disabled': 'var(--fg-disabled)',
  'table-header-fg': 'var(--table-fg)',
  'table-header-fg-disabled': 'var(--table-fg-disabled)',
  'table-stem-fg': Purple.palette[7],
  'table-stem-fg-disabled': 'var(--table-fg-disabled)',
  'table-escape-fg': Teal.palette[6],
  'table-escape-fg-disabled': 'var(--table-fg-disabled)',
  'table-custom-form-fg': accent.palette[7],
  'table-custom-form-fg-disabled': 'var(--table-fg-disabled)',
  'table-deleted-form-fg': Gray.palette[3],
  'table-deleted-form-fg-disabled': Gray.palette[2],
  'table-bg': 'var(--bg)',
  'table-bg-selected': '#def2fc',
  'table-bg-disabled': 'var(--table-bg)',
  'table-header-bg': Gray.palette[2],
  'table-header-bg-selected': '#abdef7',
  'table-header-bg-disabled': Gray.palette[1],
  'table-border': Gray.palette[3],
  'table-border-selected': '#63bfee',
  'table-border-disabled': Gray.palette[2],
});

export const darkThemeVars = (accent: Shade): ThemeVariables => ({
  'table-fg': 'var(--fg)',
  'table-fg-disabled': 'var(--fg-disabled)',
  'table-header-fg': 'var(--table-fg)',
  'table-header-fg-disabled': 'var(--table-fg-disabled)',
  'table-stem-fg': Purple.palette[3],
  'table-stem-fg-disabled': 'var(--table-fg-disabled)',
  'table-escape-fg': Teal.palette[3],
  'table-escape-fg-disabled': 'var(--table-fg-disabled)',
  'table-custom-form-fg': accent.palette[3],
  'table-custom-form-fg-disabled': 'var(--table-fg-disabled)',
  'table-deleted-form-fg': Gray.palette[7],
  'table-deleted-form-fg-disabled': Gray.palette[8],
  'table-bg': 'var(--bg)',
  'table-bg-selected': '#0a364c', // TODO
  'table-bg-disabled': 'var(--table-bg)',
  'table-header-bg': Gray.palette[8],
  'table-header-bg-selected': '#105375', // TODO
  'table-header-bg-disabled': Gray.palette[9],
  'table-border': Gray.palette[7],
  'table-border-selected': '#1474a3', // TODO
  'table-border-disabled': Gray.palette[8],
});
