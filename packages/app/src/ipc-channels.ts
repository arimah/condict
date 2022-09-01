import {
  ContextMenuParams,
  OpenDialogOptions,
  OpenDialogReturnValue,
} from 'electron';

import type {DictionaryEventBatch} from '@condict/server';

import {
  IpcRendererMessage,
  ExecuteOperationArg,
  OperationResult,
  AppConfig,
  ThemeName,
  Locale,
  UpdateStatus,
  UpdateProgress,
  SavedSession,
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

  /** Informs the renderer that the update status has changed. */
  'update-status-changed': UpdateStatus;

  /** Sends an event batch of dictionary changes to the renderer. */
  'dictionary-event-batch': DictionaryEventBatch;

  /**
   * Informs the renderer that the current version u pdate download progress has
   * changed. The value is a percentage between 0 and 100.
   */
  'update-download-progress': number;
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

  /** Gets the current update progress. */
  'get-update-progress': IpcRendererMessage<void, UpdateProgress>;

  /**
   * Asks the main process to check for updates. If the application is currently
   * waiting to download a new version (i.e. knows there is an update), download
   * a new version, or has a new version downloaded, this call is a no-op.
   *
   * If and when the update status is updated, the main process sends the IPC
   * message `update-status-changed`.`
   *
   * If the call is a no-op, the returned promise resolves immediately.
   * Otherwise, the promise resolves when the update check is completed.
   */
  'check-for-updates': IpcRendererMessage<void, void>;

  /**
   * Asks the main process to download the pending update and prepare it for
   * installation. If there is no pending update, or the application is waiting
   * to restart after downloading an update, this call is a no-op.
   *
   * During the download, the main process will periodically send IPC messages
   * with the download progress (`update-download-progress`).
   *
   * If and when the update status is updated, the main process sends the IPC
   * message `update-status-changed`.`
   *
   * If the call is a no-op, the returned promise resolves immediately.
   * Otherwise, the promise resolves when the download is completed.
   */
  'download-update': IpcRendererMessage<void, void>;

  /**
   * TEMPORARY TEST MESSAGE. Resets the update status to 'unknown'.
   */
  'reset-update-status': IpcRendererMessage<void, void>;

  /** Updates the current session. */
  'update-session': IpcRendererMessage<SavedSession, void>;

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
    /** The previous session, if there is one. */
    lastSession: SavedSession | null;
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
