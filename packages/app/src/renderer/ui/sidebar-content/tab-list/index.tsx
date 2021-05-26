import HomeIcon from 'mdi-react/BookshelfIcon';
import LanguageIcon from 'mdi-react/BookOpenPageVariantOutlineIcon';
import TableIcon from 'mdi-react/TableLargeIcon';
import LemmaIcon from 'mdi-react/CardBulletedOutlineIcon';
import SearchResultsIcon from 'mdi-react/TextSearchIcon';

import {CloseIcon, DirtyIcon} from './icons';
import * as S from './styles';

const TabList = (): JSX.Element => {
  return (
    <S.TabList>
      <S.Tab>
        <HomeIcon/>
        <S.TabTitle>Condict</S.TabTitle>
      </S.Tab>
      <S.Tab>
        <LanguageIcon/>
        <S.TabTitle>Second tab</S.TabTitle>
        <S.CloseButton title='Close tab'>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
      <S.Tab isChild>
        <TableIcon/>
        <S.TabTitle>Type II, vowel-final</S.TabTitle>
        <S.CloseButton title={`Close tab\nThis tab has unsaved changes.`}>
          <DirtyIcon/>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
      <S.Tab isChild isCurrent tabIndex={0}>
        <LemmaIcon/>
        <S.TabTitle>bird</S.TabTitle>
        <S.CloseButton title='Close tab'>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
      <S.Tab isChild>
        <S.TabSpinner/>
        <LemmaIcon/>
        <S.TabTitle>
          extravagant
        </S.TabTitle>
        <S.CloseButton title='Close tab'>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
      <S.Tab>
        <LanguageIcon/>
        <S.TabTitle>
          This tab has an extremely long title that does not fit completely
        </S.TabTitle>
        <S.CloseButton title='Close tab'>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
      <S.Tab>
        <SearchResultsIcon/>
        <S.TabTitle>
          Search: foo bar
        </S.TabTitle>
        <S.CloseButton title='Close tab'>
          <CloseIcon/>
        </S.CloseButton>
      </S.Tab>
    </S.TabList>
  );
};

export default TabList;
