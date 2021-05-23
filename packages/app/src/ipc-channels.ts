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
} from './types';

/** IPC messages sent from the main process to a browser window. */
export type MainChannels = {
  /** Requests to open a context menu. */
  'context-menu': ContextMenuParams;

  /** Requests to open the settings dialog. */
  'open-settings': void;
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

  /** Requests to show a file open dialog. */
  'show-open-dialog': IpcRendererMessage<
    OpenDialogOptions,
    OpenDialogReturnValue
  >;

  /** Executes an edit command on the browser window. */
  'execute-edit-command': IpcRendererMessage<EditCommand, void>;
};

export type EditCommand =
  | 'undo'
  | 'redo'
  | 'cut'
  | 'copy'
  | 'paste'
  | 'delete'
  | 'selectAll';
