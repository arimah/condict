import {useCallback} from 'react';
import {Localized} from '@fluent/react';
import SearchIcon from 'mdi-react/MagnifyIcon';

import {useNavigateTo} from '../../navigation';
import {useOpenDialog} from '../../dialog-stack';
import {searchInLanguageDialog} from '../../dialogs';
import {LanguageId} from '../../graphql';

import * as S from './styles';

export type Props = {
  id: LanguageId;
  name: string;
};

const LanguageSearch = (props: Props): JSX.Element => {
  const {id, name} = props;

  const navigateTo = useNavigateTo();
  const openDialog = useOpenDialog();

  const handleClick = useCallback(() => {
    void openDialog(searchInLanguageDialog(id, name)).then(page => {
      if (page) {
        navigateTo(page);
      }
    });
  }, [id, name, navigateTo, openDialog]);

  return (
    <S.Search>
      <S.SearchButton onClick={handleClick}>
        <SearchIcon/>
        <span>
          <Localized id='language-search-button'/>
        </span>
      </S.SearchButton>
    </S.Search>
  );
};

export default LanguageSearch;
