import {useState, useCallback, useRef} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import CloseIcon from 'mdi-react/CloseIcon';

import {useUniqueId} from '@condict/ui';

import {DialogParams, DialogProps} from '../../dialog-stack';

import TabList from './tab-list';
import AllSections from './sections';
import {SectionHandle} from './types';
import * as S from './styles';

const SettingsDialog = (props: DialogProps<void>): JSX.Element => {
  const {animationPhase, onAnimationPhaseEnd, onResolve} = props;

  const {l10n} = useLocalization();

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSectionRef = useRef<SectionHandle>(null);
  const tryLeaveSection = useCallback((leave: () => void) => {
    const section = currentSectionRef.current;
    if (!section) {
      return;
    }

    if (typeof section.canLeave !== 'boolean') {
      void section.canLeave().then(canLeave => {
        if (canLeave) {
          leave();
        }
      });
    } else if (section.canLeave) {
      leave();
    }
  }, []);

  const handleCloseClick = useCallback(() => {
    tryLeaveSection(onResolve);
  }, [tryLeaveSection]);

  const id = useUniqueId();

  return (
    <S.Main
      title={l10n.getString('settings-title')}
      animationPhase={animationPhase}
      onAnimationPhaseEnd={onAnimationPhaseEnd}
    >
      <S.Sidebar aria-label={l10n.getString('settings-sidebar-label')}>
        <S.Title>
          <Localized id='settings-title'/>
        </S.Title>
        <TabList
          dialogId={id}
          currentIndex={currentIndex}
          onTrySetCurrentIndex={nextIndex =>
            tryLeaveSection(() => setCurrentIndex(nextIndex))
          }
        />
      </S.Sidebar>
      {AllSections.map(({key, content: Content}, i) =>
        <S.Section
          key={key}
          id={`${id}-tabpanel-${key}`}
          aria-expanded={i === currentIndex}
          isCurrent={i === currentIndex}
        >
          <S.Title>
            <Localized id={`settings-section-${key}`}/>
          </S.Title>
          <Content
            ref={i === currentIndex ? currentSectionRef : undefined}
          />
        </S.Section>
      )}
      <S.CloseButton
        label={l10n.getString('settings-close-button')}
        title={l10n.getString('settings-close-button')}
        onClick={handleCloseClick}
        onMouseDown={e => e.preventDefault()}
      >
        <CloseIcon/>
      </S.CloseButton>
    </S.Main>
  );
};

const settingsDialog: DialogParams<void> = {
  // eslint-disable-next-line react/display-name
  render: props => <SettingsDialog {...props}/>,
};

export default settingsDialog;
