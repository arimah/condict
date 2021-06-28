import {
  ContextMenuParams,
  OpenDialogOptions,
  OpenDialogReturnValue,
} from 'electron';

import {
  IpcRendererMessage,
  ExecuteOperationArg,
  OperationResult,
  AppConfig,
  ThemeName,
  Locale,
} from './types';

/** IPC messages sent from the main process to a browser window. */
export type MainChannels = {
  /** Requests to open a context menu. */
  'context-menu': ContextMenuParams;

  /** Requests to open the settings dialog. */
  'open-settings': void;

  /** Informs the renderer that the system theme has changed. */
  'system-theme-change': ThemeName;

  /** Informs the renderer that a locale source file has changed. */
  'locale-updated': string;

  /** Informs the renderer that the set of available locales has changed. */
  'available-locales-changed': readonly string[];
};

/** IPC messages sent from a browser window to the main process. */
export type RendererChannels = {
  /**
   * Signals that the browser window is done initializing and is ready to
   * perform work. The main process resolves the reply promise when it is
   * done initializing and is ready to accept work.
   */
  'window-ready': IpcRendererMessage<void, void>;

  /** Executes a GraphQL operation against the current server. */
  'execute-operation': IpcRendererMessage<
    ExecuteOperationArg,
    OperationResult<unknown>
  >;

  /** Gets the current app configuration. */
  'get-config': IpcRendererMessage<void, AppConfig>;

  'get-config-path': IpcRendererMessage<void, string>;

  /** Sets the current app configuration. */
  'set-config': IpcRendererMessage<AppConfig, void>;

  /**
   * Gets the source text of the specified translation bundle. This may involve
   * reading a file. The reply contains the raw translation source text.
   */
  'get-locale': IpcRendererMessage<string, Locale>;

  /** Requests to show a file open dialog. */
  'show-open-dialog': IpcRendererMessage<
    OpenDialogOptions,
    OpenDialogReturnValue
  >;

  /** Executes an edit command on the browser window. */
  'execute-edit-command': IpcRendererMessage<EditCommand, void>;

  /**
   * Gets the initial application state, which includes its configuration and
   * other details necessary to perform the first render.
   */
  'get-initial-state': IpcRendererMessage<void, {
    /** The current app config. */
    config: AppConfig;
    /** The system theme (light/dark). */
    systemTheme: ThemeName;
    /** The available translation locales (as ISO language codes). */
    availableLocales: readonly string[];
    /** The default/fallback locale. */
    defaultLocale: Locale;
    /** The user's selected locale. */
    currentLocale: Locale;
  }>;
};

export type EditCommand =
  | 'undo'
  | 'redo'
  | 'cut'
  | 'copy'
  | 'paste'
  | 'delete'
  | 'selectAll';
