import {UpdateStatus} from '../types';

import ipc from './ipc';

export interface Updater {
  /**
   * A function that is called when the update status changes.
   * @param status The new update status.
   */
  onStatusChanged: StatusChangedCallback | null;
  /**
   * A function that is called when on download progress.
   * @param progress The new download progress, as a percentage between 0 and 100.
   */
  onDownloadProgress: DownloadProgressCallback | null;
}

export type StatusChangedCallback = (status: UpdateStatus) => void;

export type DownloadProgressCallback = (progress: number) => void;

type InternalState =
  | IdleState
  | CheckingState
  | DownloadingState
  | PendingRestartState;

interface IdleState {
  readonly type: 'idle';
}

interface CheckingState {
  readonly type: 'checking';
  readonly promise: Promise<void>;
}

interface DownloadingState {
  readonly type: 'downloading';
  readonly promise: Promise<void>;
}

interface PendingRestartState {
  readonly type: 'pendingRestart';
}

const initUpdater = (): Updater => {
  let state: InternalState = {type: 'idle'};
  let hasUpdate: boolean | null = null;
  let downloadProgress = 0;

  let lastStatus = getUpdateStatus(state, hasUpdate);

  let onStatusChanged: StatusChangedCallback | null = null;
  let onDownloadProgress: DownloadProgressCallback | null = null;

  const setState = (nextState: InternalState) => {
    state = nextState;

    const nextStatus = getUpdateStatus(state, hasUpdate);
    if (nextStatus !== lastStatus) {
      lastStatus = nextStatus;
      onStatusChanged?.(nextStatus);
    }
  };

  ipc.handle('get-update-progress', () => {
    return {status: lastStatus, downloadProgress};
  });

  ipc.handle('check-for-updates', () => {
    switch (state.type) {
      case 'idle': {
        const promise = checkForUpdates().then(update => {
          hasUpdate = update;
          setState({type: 'idle'});
        });

        setState({type: 'checking', promise});

        return promise;
      }
      case 'checking':
        return state.promise;
    }
    return undefined;
  });

  ipc.handle('download-update', () => {
    switch (state.type) {
      case 'idle':
        if (hasUpdate) {
          downloadProgress = 0;

          const promise = downloadUpdate(progress => {
            downloadProgress = progress;
            onDownloadProgress?.(progress);
          }).then(() => {
            downloadProgress = 0;
            setState({type: 'pendingRestart'});
          });

          setState({type: 'downloading', promise});

          return promise;
        }
        break;
      case 'downloading':
        return state.promise;
    }
    return undefined;
  });

  ipc.handle('reset-update-status', () => {
    hasUpdate = false;
    downloadProgress = 0;
    setState({type: 'idle'});
  });

  return {
    get onStatusChanged() {
      return onStatusChanged;
    },
    set onStatusChanged(value: StatusChangedCallback | null) {
      onStatusChanged = value;
    },

    get onDownloadProgress() {
      return onDownloadProgress;
    },
    set onDownloadProgress(value: DownloadProgressCallback | null) {
      onDownloadProgress = value;
    },
  };
};

export default initUpdater;

const getUpdateStatus = (
  state: InternalState,
  hasUpdate: boolean | null
): UpdateStatus => {
  switch (state.type) {
    case 'idle':
      switch (hasUpdate) {
        case true:
          return 'updateAvailable';
        case false:
          return 'isLatest';
        case null:
          return 'unknown';
      }
    // eslint-disable-next-line no-fallthrough
    case 'checking':
      return 'checking';
    case 'downloading':
      return 'downloading';
    case 'pendingRestart':
      return 'downloadedNeedsRestart';
  }
};

const checkForUpdates = (): Promise<boolean> => {
  // TODO: Perform an actual update check
  return new Promise<boolean>(resolve => {
    const delay = Math.floor(1000 + 3000 * Math.random());
    setTimeout(() => {
      resolve(Math.random() > 0.5);
    }, delay);
  });
};

const downloadUpdate = (
  onProgress: DownloadProgressCallback
): Promise<void> => {
  // TODO: Perform an actual download
  return new Promise<void>(resolve => {
    let progress = 0;

    onProgress(0);

    const percentPerTick = 1 + 4 * Math.floor(Math.random());
    const intervalId = setInterval(() => {
      progress = Math.min(progress + percentPerTick, 100);

      if (progress === 100) {
        clearInterval(intervalId);
        onProgress(0);
        resolve();
      } else {
        onProgress(progress);
      }
    }, 100);
  });
};
