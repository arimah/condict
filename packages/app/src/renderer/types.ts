import {Draft} from 'immer';

import {AppConfig} from '../types';

export type ConfigRecipe = (draft: Draft<AppConfig>) => AppConfig | void;
