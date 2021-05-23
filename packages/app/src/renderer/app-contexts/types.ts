import {AppConfig} from '../../types';

import {ConfigRecipe} from '../types';

export interface ConfigContextValue {
  /** The current application configuration. */
  readonly config: AppConfig;
  /**
   * Updates the application according to the specified recipe.
   * @param recipe A function that modifies the config or returns a new config.
   */
  readonly updateConfig: (recipe: ConfigRecipe) => void;
  /**
   * If true, a restart is needed in order to fully apply the configuration.
   * For example, if the server config is modified. If false, no restart is
   * needed.
   */
  readonly needsRestart: boolean;
}
