import {Draft} from 'immer';

import {Theme as UITheme} from '@condict/ui';

import {AppConfig} from '../types';

export interface AppTheme extends UITheme {
  /** Sidebar colors. */
  readonly sidebar: SidebarColors;
}

export interface SidebarColors {
  /** Foreground color. Paired with bg, hoverBg and activeBg. */
  readonly fg: string;
  /** Background color. Paired with fg. */
  readonly bg: string;
  /** Hover background color. Paired with fg. */
  readonly hoverBg: string;
  /** Active/pressed background color. Paired with fg. */
  readonly activeBg: string;
}

export type ConfigRecipe = (draft: Draft<AppConfig>) => AppConfig | void;
