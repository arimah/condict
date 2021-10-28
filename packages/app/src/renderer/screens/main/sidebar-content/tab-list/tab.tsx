import React, {MouseEvent, Ref, useCallback} from 'react';
import {useLocalization} from '@fluent/react';
import CrashedIcon from 'mdi-react/AlertIcon';

import {Tab as NavTab} from '../../../../navigation';
import {PageIcon} from '../../../../ui';

import {CloseIcon, DirtyIcon} from './icons';
import * as S from './styles';

export type Props = {
  tab: NavTab;
  isCurrent: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
}

const handleCloseButtonMouseDown = (e: MouseEvent) => {
  // We do NOT want the event to travel up to the tab, as that would select it.
  e.stopPropagation();
  // And we must prevent focus.
  e.preventDefault();
};

const Tab = React.forwardRef((
  props: Props,
  ref: Ref<HTMLDivElement>
): JSX.Element => {
  const {tab, isCurrent, onSelect, onClose, onMouseDown} = props;
  const {id} = tab;

  const {l10n} = useLocalization();

  const handleTabMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    onMouseDown(e);

    if (e.button === 0) {
      onSelect(id);
    }
  }, [id, onSelect, onMouseDown]);

  const handleTabAuxClick = useCallback((e: MouseEvent) => {
    if (e.button === 1) {
      onClose(id);
    }
  }, [id, onClose]);

  const handleCloseButtonClick = useCallback(() => {
    onClose(id);
  }, [id, onClose]);

  const isDirty = NavTab.isDirty(tab);
  const isCrashed = NavTab.isCrashed(tab);

  return (
    <S.Tab
      id={`tab-${id}`}
      tabIndex={isCurrent ? 0 : -1}
      isCurrent={isCurrent}
      isChild={NavTab.isChild(tab)}
      isCrashed={isCrashed}
      aria-labelledby={`tab-${id}-title`}
      aria-selected={isCurrent}
      aria-controls={`tabpanel-${id}`}
      onMouseDown={handleTabMouseDown}
      onAuxClick={handleTabAuxClick}
      ref={ref}
    >
      {isCrashed ? <CrashedIcon/> : <PageIcon page={tab.page}/>}
      <S.TabTitle id={`tab-${id}-title`}>
        {NavTab.getFullTitle(tab, l10n)}
      </S.TabTitle>
      {NavTab.canClose(tab) && (
        <S.CloseButton
          title={l10n.getString(
            isDirty
              ? 'sidebar-tab-close-button-unsaved-tooltip'
              : 'sidebar-tab-close-button-tooltip'
          )}
          isCurrentTab={isCurrent}
          onMouseDown={handleCloseButtonMouseDown}
          onClick={handleCloseButtonClick}
        >
          {isDirty && <DirtyIcon/>}
          <CloseIcon/>
        </S.CloseButton>
      )}
    </S.Tab>
  );
});

Tab.displayName = 'Tab';

export default Tab;
