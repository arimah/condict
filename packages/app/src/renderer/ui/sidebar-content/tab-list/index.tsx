import HomeIcon from 'mdi-react/BookshelfIcon';
import LanguageIcon from 'mdi-react/BookOpenPageVariantOutlineIcon';
import TableIcon from 'mdi-react/TableLargeIcon';
import LemmaIcon from 'mdi-react/CardBulletedOutlineIcon';
import SearchResultsIcon from 'mdi-react/TextSearchIcon';
import {useLocalization} from '@fluent/react';

import {CloseIcon, DirtyIcon} from './icons';
import * as S from './styles';

const TabList = (): JSX.Element => {
  const {l10n} = useLocalization();
  const closeTabTitle = l10n.getString('sidebar-tab-close-button-tooltip');
  return (
    <S.TabList>
      <S.Tab>
        <HomeIcon/>
        <S.TabTitle>Condict</S.TabTitle>
      </S.Tab>
      <S.Tab>
        <LanguageIcon/>
        <S.TabTitle>Second tab</S.TabTitle>
        <S.CloseButton title={closeTabTitle}>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
      <S.Tab isChild>
        <TableIcon/>
        <S.TabTitle>Type II, vowel-final</S.TabTitle>
        <S.CloseButton
          title={l10n.getString('sidebar-tab-close-button-unsaved-tooltip')}
        >
          <DirtyIcon/>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
      <S.Tab isChild isCurrent tabIndex={0}>
        <LemmaIcon/>
        <S.TabTitle>bird</S.TabTitle>
        <S.CloseButton title={closeTabTitle}>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
      <S.Tab isChild>
        <S.TabSpinner/>
        <LemmaIcon/>
        <S.TabTitle>
          extravagant
        </S.TabTitle>
        <S.CloseButton title={closeTabTitle}>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
      <S.Tab>
        <LanguageIcon/>
        <S.TabTitle>
          This tab has an extremely long title that does not fit completely
        </S.TabTitle>
        <S.CloseButton title={closeTabTitle}>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
      <S.Tab>
        <SearchResultsIcon/>
        <S.TabTitle>
          Search: foo bar
        </S.TabTitle>
        <S.CloseButton title={closeTabTitle}>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
    </S.TabList>
  );
};

export default TabList;
