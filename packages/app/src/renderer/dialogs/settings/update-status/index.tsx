import {useState, useCallback, useEffect} from 'react';
import {Localized} from '@fluent/react';
import FetchIcon from 'mdi-react/SyncIcon';
import DownloadIcon from 'mdi-react/DownloadIcon';
import UpdateIcon from 'mdi-react/CheckboxMarkedCircleOutlineIcon';

import {Button, ButtonIntent, useUniqueId} from '@condict/ui';

import {UpdateStatus} from '../../../../types';

import ipc from '../../../ipc';

import ProgressRing from './progress-ring';
import * as S from './styles';

// TODO: Implement an actual automatic updater.
// This is fake placeholder code designed to test the UI.

const Icons = {
  unknown: <FetchIcon/>,
  isLatest: <FetchIcon/>,
  updateAvailable: <DownloadIcon/>,
  downloadedNeedsRestart: <UpdateIcon/>,
} as const;

const L10nButtonLabels = {
  unknown: 'settings-updates-check-button',
  isLatest: 'settings-updates-check-button',
  checking: 'settings-updates-check-button',
  updateAvailable: 'settings-updates-download-button',
  downloading: 'settings-updates-download-button',
  downloadedNeedsRestart: 'settings-updates-install-button',
} as const;

const L10nStatusMessages = {
  isLatest: 'settings-updates-is-latest',
  updateAvailable: 'settings-updates-available',
  checking: 'settings-updates-checking',
  downloading: 'settings-updates-downloading',
  downloadedNeedsRestart: 'settings-updates-downloaded',
} as const;

const StatusIntents: Record<UpdateStatus, ButtonIntent> = {
  unknown: 'general',
  checking: 'general',
  isLatest: 'general',
  updateAvailable: 'bold',
  downloading: 'bold',
  downloadedNeedsRestart: 'accent',
};

const Status = (): JSX.Element => {
  const [status, setStatus] = useState<UpdateStatus>('unknown');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleClick = useCallback(() => {
    getNextStatus(status);
  }, [status]);

  useEffect(() => {
    void ipc.invoke('get-update-progress').then(result => {
      setStatus(result.status);
      setDownloadProgress(result.downloadProgress);
    });

    const handleStatus = (_: unknown, status: UpdateStatus) => {
      setStatus(status);
    };
    ipc.on('update-status-changed', handleStatus);
    const handleDownloadProgress = (_: unknown, progress: number) => {
      setDownloadProgress(progress);
    };
    ipc.on('update-download-progress', handleDownloadProgress);

    return () => {
      ipc.removeListener('update-status-changed', handleStatus);
      ipc.removeListener('update-download-progress', handleDownloadProgress);
    };
  }, []);

  const id = useUniqueId();

  return (
    <S.Main>
      <Button
        intent={StatusIntents[status]}
        aria-live='polite'
        aria-relevant='text'
        aria-busy={status === 'checking' || status === 'downloading'}
        aria-describedby={status !== 'unknown' ? `${id}-status` : undefined}
        onClick={handleClick}
      >
        {getIcon(status, downloadProgress)}
        <span>
          <Localized id={L10nButtonLabels[status]}/>
        </span>
      </Button>
      {status !== 'unknown' &&
        <span id={`${id}-status`}>
          <Localized id={L10nStatusMessages[status]}/>
        </span>}
    </S.Main>
  );
};

export default Status;

const getIcon = (status: UpdateStatus, downloadProgress: number) => {
  if (status === 'downloading') {
    if (downloadProgress > 0) {
      return <ProgressRing progress={downloadProgress / 100}/>;
    }
    return <S.Spinner/>;
  }

  if (status === 'checking') {
    return <S.Spinner/>;
  }

  return Icons[status];
};

const getNextStatus = (status: UpdateStatus) => {
  switch (status) {
    case 'unknown':
    case 'isLatest':
      void ipc.invoke('check-for-updates');
      break;
    case 'updateAvailable':
      void ipc.invoke('download-update');
      break;
    case 'downloadedNeedsRestart':
      // TODO: Restart for update
      void ipc.invoke('reset-update-status');
      break;
  }
};
