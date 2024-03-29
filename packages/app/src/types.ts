import type {SourceLocation} from 'graphql';

import type {
  ServerConfig as BaseServerConfig,
  LoggerOptions,
} from '@condict/server';
import type {
  MotionPreference,
  FontSizeOption,
  LineHeightOption,
  ThemeVariables,
} from '@condict/ui';

export interface AppConfig {
  /** Condict UI appearance configuration. */
  readonly appearance: AppearanceConfig;
  /** The application language, as a language code. */
  readonly locale: string;
  /** The automatic updates policy. */
  readonly updates: UpdatePolicy;
  /** Logger configuration. */
  readonly log: LoggerOptions;
  /** Server configuration. */
  readonly server: ServerConfig;
  /** Remote server login configuration. */
  readonly login: LoginConfig;
}

export interface AppearanceConfig {
  /** The user's preferred theme (light or dark). */
  readonly theme: ThemePreference;
  /** The accent color. */
  readonly accentColor: ColorName;
  /** The danger color, used for destructive actions. */
  readonly dangerColor: ColorName;
  /** The sidebar color. */
  readonly sidebarColor: ColorName;
  /**
   * The font size. Note: this is a string value, as the font size cannot
   * be set to an arbitrary value.
   */
  readonly fontSize: FontSizeOption;
  /**
   * The text line height. Note: this is a string value, as the line height
   * cannot be set to an arbitrary value.
   */
  readonly lineHeight: LineHeightOption;
  /** The zoom level, as an integer percentage (100% = 100). */
  readonly zoomLevel: number;
  /** The motion preference, which controls animations in the app. */
  readonly motion: MotionPreference;
  /** The path to the user theme file, or null if no user theme is loaded. */
  readonly userThemeFile: string | null;
}

export type ThemePreference = ThemeName | 'system';

export type ThemeName = 'light' | 'dark';

export type ColorName =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'gray';

export type UpdatePolicy =
  // Checks for updates, downloads them automatically, and installs when
  // Condict is restarted.
  | 'download'
  // Checks for updates, but lets the user choose when to download and
  // install them.
  | 'check'
  // Does not check for updates automatically. The user can still download
  // and install updates manually.
  | 'manual';

export type ServerConfig = LocalServerConfig | RemoteServerConfig;

/**
 * Contains configuration for a local server; that is, a server that the local
 * Condict instance manages.
 */
export interface LocalServerConfig extends BaseServerConfig {
  readonly kind: 'local';
}

/** Contains configuration for a remote server, which is accessed over HTTP. */
export interface RemoteServerConfig {
  readonly kind: 'remote';
  /** The URL of the GraphQL server. */
  readonly url: string;
}

/** Contains remote server login configuration. */
export interface LoginConfig {
  /** The name that the user is logged in as. */
  readonly username: string | null;
  /** The session token. */
  readonly sessionToken: string | null;
}

/**
 * Contains metadata about a user theme, as well as the custom theme variables
 * for styling the UI.
 */
export interface UserTheme {
  /** The theme name. */
  readonly name: string;
  /** The theme's author. */
  readonly author: string | null;
  /** The theme that this user theme extends. */
  readonly extends: 'light' | 'dark';
  /** Theme variables exposed by this theme. */
  readonly vars: ThemeVariables;
}

/**
 * Type information about an IPC message sent from the renderer process to the
 * main process.
 */
export interface IpcRendererMessage<A, R> {
  /**
   * The type of the argument passed to the main process. If void, no argument
   * is passed.
   */
  readonly Arg: A;
  /** The expected reply type. */
  readonly Reply: R;
}

export type IpcMessageArg<A> = A extends void ? [] : [A];

/** Argument to the 'execute-operation' IPC message. */
export interface ExecuteOperationArg {
  readonly operation: string;
  readonly variableValues: VariableValues | null;
}

export type VariableValues = {
  readonly [key: string]: any;
};

/** The result of a GraphQL operation message. */
export interface OperationResult<D> {
  readonly data?: D | null;
  readonly errors?: readonly ExecuteError[] | null;
}

/**
 * A GraphQL execution error. This is a subset of the GraphQLError type, made
 * compatible with the JSON payload.
 */
export interface ExecuteError {
  readonly message: string;
  readonly locations?: readonly SourceLocation[];
  readonly path?: readonly (string | number)[];
  readonly extensions?: Record<string, unknown>;
}

/** A translation bundle for a specific locale. */
export interface Locale {
  /** The locale name, as an ISO language code. */
  readonly name: string;
  /** The locale's raw translation bundle. */
  readonly source: string;
}

export type UpdateStatus =
  | 'unknown'
  | 'isLatest'
  | 'updateAvailable'
  | 'checking'
  | 'downloading'
  | 'downloadedNeedsRestart';

/**
 * Encapsulates the current update progress, which combines an update status
 * with download progress.
 */
export interface UpdateProgress {
  /** The current update status. */
  readonly status: UpdateStatus;
  /** The current download progress as a percentage between 0 and 100. */
  readonly downloadProgress: number;
}

export interface SavedSession {
  readonly tabs: readonly SavedTab[];
  /** The ID of the currently focused tab. */
  readonly currentTab: string | null;
}

export interface SavedTab {
  /**
   * A generic unique ID for the tab. Referred to by `currentTab` on the
   * session object.
   */
  readonly id: string;
  /**
   * The page that the tab contains. This value is validated entirely by the
   * renderer.
   */
  readonly page: unknown;
  /** The title of the tab. */
  readonly title: string;
  /** The previous tab in the tab's history. */
  readonly previous: SavedPreviousTab | null;
}

export interface SavedPreviousTab {
  /** The page that the tab contains. */
  readonly page: unknown;
  /** The title of the tab. */
  readonly title: string;
  /** The previous tab in the tab's history. */
  readonly previous: SavedPreviousTab | null;
}
