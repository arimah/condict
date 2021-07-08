import {useState, useCallback} from 'react';
import {Localized} from '@fluent/react';
import FetchIcon from 'mdi-react/SyncIcon';
import DownloadIcon from 'mdi-react/DownloadIcon';
import UpdateIcon from 'mdi-react/CheckboxMarkedCircleOutlineIcon';

import {useUniqueId} from '@condict/ui';

import ProgressRing from './progress-ring';
import * as S from './styles';

// TODO: Implement an actual automatic updater.
// This is fake placeholder code designed to test the UI.
type UpdateStatus =
  | 'unknown'
  | 'isLatest'
  | 'updateAvailable'
  | 'downloadedNeedsRestart';

const Icons = {
  unknown: <FetchIcon/>,
  isLatest: <FetchIcon/>,
  updateAvailable: <DownloadIcon/>,
  downloadedNeedsRestart: <UpdateIcon/>,
} as const;

const L10nButtonLabels = {
  unknown: 'settings-updates-check-button',
  isLatest: 'settings-updates-check-button',
  updateAvailable: 'settings-updates-download-button',
  downloadedNeedsRestart: 'settings-updates-install-button',
} as const;

const L10nStatusMessages = {
  isLatest: 'settings-updates-is-latest',
  updateAvailable: 'settings-updates-available',
  downloadedNeedsRestart: 'settings-updates-downloaded',
} as const;

const Status = (): JSX.Element => {
  const [status, setStatus] = useState<UpdateStatus>('unknown');
  const [busy, setBusy] = useState(false);

  const [downloadProgress, setDownloadProgress] = useState(0);

  const id = useUniqueId();

  const handleClick = useCallback(() => {
    setBusy(busy => {
      if (!busy) {
        void getNextStatus(status, setDownloadProgress).then(nextStatus => {
          setBusy(false);
          setStatus(nextStatus);
        });
      }
      return true;
    });
  }, [status]);

  return (
    <S.Main>
      <S.MainButton
        bold={
          status === 'updateAvailable' ||
          status === 'downloadedNeedsRestart'
        }
        aria-live='polite'
        aria-relevant='text'
        aria-busy={busy}
        aria-describedby={status !== 'unknown' ? `${id}-status` : undefined}
        onClick={handleClick}
      >
        {
          status === 'updateAvailable' && busy && downloadProgress > 0
            ? <ProgressRing progress={downloadProgress / 100}/>
            : busy
              ? <S.Spinner/>
              : Icons[status]
        }
        <span>
          <Localized id={L10nButtonLabels[status]}/>
        </span>
      </S.MainButton>
      {status !== 'unknown' &&
        <span id={`${id}-status`}>
          <Localized id={L10nStatusMessages[status]}/>
        </span>}
    </S.Main>
  );
};

export default Status;

const getNextStatus = (
  status: UpdateStatus,
  setDownloadProgress: (progress: number) => void
): Promise<UpdateStatus> => {
  let nextStatus: UpdateStatus;
  let delay: number;
  switch (status) {
    case 'unknown':
      nextStatus = 'isLatest';
      delay = Math.floor(1000 + 3000 * Math.random());
      break;
    case 'isLatest':
      nextStatus = 'updateAvailable';
      delay = Math.floor(1000 + 3000 * Math.random());
      break;
    case 'updateAvailable': {
      nextStatus = 'downloadedNeedsRestart';
      delay = Math.floor(5000 + 10000 * Math.random());

      // Simulate some initial connection delay, then smooth progress.
      const initialDelay = Math.floor(250 + 1000 * Math.random());
      const interval = (delay - initialDelay) / 50;

      let progress = 0;
      const updateProgress = () => {
        setDownloadProgress(progress);
        progress += 2;

        if (progress < 100) {
          window.setTimeout(updateProgress, interval);
        }
      };
      window.setTimeout(updateProgress, initialDelay);
      setDownloadProgress(0);
      break;
    }
    case 'downloadedNeedsRestart':
      nextStatus = 'isLatest';
      delay = 0;
      break;
  }

  return new Promise<UpdateStatus>(resolve => {
    window.setTimeout(() => resolve(nextStatus), delay);
  });
};
