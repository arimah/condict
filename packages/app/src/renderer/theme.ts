import {Gray, Shade, ThemeVariables} from '@condict/ui';

import {ColorName} from '../types';

export const lightThemeVars = (accent: Shade): ThemeVariables => ({
  'button-naked-fg': 'var(--fg)',
  'button-naked-fg-disabled': 'var(--fg-disabled)',
  'button-naked-bg': 'var(--bg)',
  'button-naked-bg-hover': 'var(--bg-hover)',
  'button-naked-bg-pressed': 'var(--bg-pressed)',
  'button-naked-bg-disabled': 'var(--bg)',
  'button-naked-border': 'var(--button-naked-bg)',
  'button-naked-border-hover': 'var(--button-naked-bg-hover)',
  'button-naked-border-pressed': 'var(--button-naked-bg-pressed)',
  'button-naked-border-disabled': 'var(--button-naked-bg-disaled)',

  'slider-tick-fg': 'var(--fg)',
  'slider-tick-fg-selected': 'var(--fg-accent)',
  'slider-tick-bg': Gray.palette[2],
  'slider-track-bg': Gray.palette[3],
  'slider-track-fill-bg': accent.palette[6],
  'slider-thumb-bg': accent.palette[6],
  'slider-thumb-bg-hover': accent.palette[5],

  'card-fg': 'var(--fg)',
  'card-bg': 'var(--bg)',
  'card-bg-hover': 'var(--card-bg)',
  'card-bg-pressed': 'var(--card-bg)',
  'card-border': 'var(--card-bg)',
  'card-border-hover': 'var(--card-border)',
  'card-border-pressed': 'var(--card-border)',
  'card-shadow': 'var(--shadow-elevation-1)',
  'card-shadow-hover': 'var(--shadow-elevation-3)',

  'dialog-shadow': '0 2px 7px rgba(0 0 0 / 0.6)',
});

export const darkThemeVars = (accent: Shade): ThemeVariables => ({
  'button-naked-fg': 'var(--fg)',
  'button-naked-fg-disabled': 'var(--fg-disabled)',
  'button-naked-bg': 'var(--bg)',
  'button-naked-bg-hover': 'var(--bg-hover)',
  'button-naked-bg-pressed': 'var(--bg-pressed)',
  'button-naked-bg-disabled': 'var(--bg)',
  'button-naked-border': 'var(--button-naked-bg)',
  'button-naked-border-hover': 'var(--button-naked-bg-hover)',
  'button-naked-border-pressed': 'var(--button-naked-bg-pressed)',
  'button-naked-border-disabled': 'var(--button-naked-bg-disaled)',

  'slider-tick-fg': 'var(--fg)',
  'slider-tick-fg-selected': 'var(--fg-accent)',
  'slider-tick-bg': Gray.palette[8],
  'slider-track-bg': Gray.palette[7],
  'slider-track-fill-bg': accent.palette[6],
  'slider-thumb-bg': accent.palette[6],
  'slider-thumb-bg-hover': accent.palette[5],

  'card-fg': 'var(--fg)',
  'card-bg': 'var(--bg)',
  'card-bg-hover': 'var(--card-bg)',
  'card-bg-pressed': 'var(--card-bg)',
  'card-border': 'var(--card-bg)',
  'card-border-hover': 'var(--card-border)',
  'card-border-pressed': 'var(--card-border)',
  'card-shadow': 'var(--shadow-elevation-1)',
  'card-shadow-hover': 'var(--shadow-elevation-3)',

  'dialog-shadow': '0 2px 7px rgba(0 0 0 / 0.8)',
});

export const SidebarColors: Record<ColorName, ThemeVariables> = {
  red: {
    'sidebar-fg': '#ffffff',
    'sidebar-bg': '#6e2121',
    'sidebar-bg-hover': '#8f2828',
    'sidebar-bg-pressed': '#511a1a',
  },
  orange: {
    'sidebar-fg': '#ffffff',
    'sidebar-bg': '#593318',
    'sidebar-bg-hover': '#72401d',
    'sidebar-bg-pressed': '#402512',
  },
  yellow: {
    'sidebar-fg': '#ffffff',
    'sidebar-bg': '#493d13',
    'sidebar-bg-hover': '#625218',
    'sidebar-bg-pressed': '#30280d',
  },
  green: {
    'sidebar-fg': '#ffffff',
    'sidebar-bg': '#274412',
    'sidebar-bg-hover': '#376218',
    'sidebar-bg-pressed': '#1c300d',
  },
  teal: {
    'sidebar-fg': '#ffffff',
    'sidebar-bg': '#134949',
    'sidebar-bg-hover': '#186262',
    'sidebar-bg-pressed': '#0f3434',
  },
  blue: {
    'sidebar-fg': '#ffffff',
    'sidebar-bg': '#213b6e',
    'sidebar-bg-hover': '#284b8f',
    'sidebar-bg-pressed': '#182a4e',
  },
  purple: {
    'sidebar-fg': '#ffffff',
    'sidebar-bg': '#631f6f',
    'sidebar-bg-hover': '#852895',
    'sidebar-bg-pressed': '#46174f',
  },
  gray: {
    'sidebar-fg': '#ffffff',
    'sidebar-bg': '#3c454e',
    'sidebar-bg-hover': '#4e5965',
    'sidebar-bg-pressed': '#31383f',
  },
};
