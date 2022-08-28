import {KeyboardEvent, ChangeEvent, useState, useCallback, useRef} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import SearchIcon from 'mdi-react/MagnifyIcon';

import {Shortcut, Checkbox, Button, useUniqueId} from '@condict/ui';

import {SearchScope, LanguageId} from '../../graphql';
import {DialogParams, DialogProps} from '../../dialog-stack';
import {AcceptKey, CancelKey} from '../../shortcuts';
import {useImmediateEntryAndExit} from '../../ui';
import {Page, SearchPage} from '../../page';

import useSearchState from './use-search-state';
import SearchResultList from './search-result-list';
import {SearchResult} from './types';
import * as S from './styles';

type Props = {
  initialLanguage?: SearchLanguage;
} & DialogProps<Page | null>;

type SearchLanguage = {
  id: LanguageId;
  name: string;
};

const PrevResultKey = Shortcut.parse('ArrowUp');

const NextResultKey = Shortcut.parse('ArrowDown');

const InitialScopes: SearchScope[] = ['SEARCH_LEMMAS', 'SEARCH_DEFINITIONS'];

const SearchDialog = (props: Props): JSX.Element => {
  const {
    initialLanguage,
    animationPhase,
    onAnimationPhaseEnd,
    onResolve,
  } = props;

  const {l10n} = useLocalization();

  const id = useUniqueId();

  const [query, setQuery] = useState('');
  const [scopes, setScopes] = useState(InitialScopes);
  const [language, setLanguage] = useState(initialLanguage);

  const {
    query: searchedQuery,
    loading,
    results,
    currentIndex,
    scrollToCurrent,
    onSelect,
  } = useSearchState(query, scopes, language?.id);

  const handleChangeScope = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const shouldInclude = e.target.checked;
    const scope = e.target.name as SearchScope;
    setScopes(scopes => {
      const doesInclude = scopes.includes(scope);
      if (shouldInclude && !doesInclude) {
        return [...scopes, scope];
      }
      if (!shouldInclude && doesInclude) {
        return scopes.filter(s => s !== scope);
      }
      return scopes;
    });
  }, []);

  const handleDialogKeyDown = useCallback((e: KeyboardEvent) => {
    if (Shortcut.matches(CancelKey, e)) {
      e.preventDefault();
      onResolve(null);
    }
  }, [onResolve]);

  const currentResult = results[currentIndex] ?? null;
  const handleInputKeyDown = useCallback((e: KeyboardEvent) => {
    if (Shortcut.matches(PrevResultKey, e)) {
      e.preventDefault();
      onSelect('prev');
    } else if (Shortcut.matches(NextResultKey, e)) {
      e.preventDefault();
      onSelect('next');
    } else if (Shortcut.matches(AcceptKey, e)) {
      e.preventDefault();
      if (currentResult) {
        onResolve(SearchResult.toPage(currentResult));
      }
    }
  }, [currentResult, onResolve]);

  const handleAdvancedSearch = useCallback(() => {
    onResolve(SearchPage(query, {language: language?.id}));
  }, [query, language, onResolve]);

  const handleClickResult = useCallback((result: SearchResult) => {
    onResolve(SearchResult.toPage(result));
  }, [onResolve]);

  const inputRef = useRef<HTMLInputElement>(null);

  useImmediateEntryAndExit(animationPhase, onAnimationPhaseEnd);

  return (
    <S.Wrapper>
      <S.Main
        aria-label={l10n.getString('search-box-title')}
        onKeyDown={handleDialogKeyDown}
      >
        <S.InputWrapper>
          <SearchIcon/>
          <S.Input
            aria-label={l10n.getString('search-box-input-label')}
            placeholder={l10n.getString('search-box-input-placeholder')}
            onKeyDown={handleInputKeyDown}
            onChange={e => setQuery(e.target.value)}
            ref={inputRef}
          />
          {loading && <S.Spinner/>}
        </S.InputWrapper>
        {language &&
          <S.SearchOptions>
            <S.SearchLanguage>
              <Localized
                id='search-box-in-language-label'
                vars={{language: language.name}}
                elems={{language: <i/>}}
              >
                <></>
              </Localized>
            </S.SearchLanguage>
            <Button
              slim
              onClick={() => {
                inputRef.current?.focus();
                setLanguage(undefined);
              }}
            >
              <Localized id='search-box-search-everywhere-button'/>
            </Button>
          </S.SearchOptions>}
        <S.SearchOptions>
          <S.SearchScopes aria-labelledby={`${id}-scopes-label`}>
            <span id={`${id}-scopes-label`}>
              <Localized id='search-box-scopes-label'/>
            </span>
            <Checkbox
              label={l10n.getString('search-box-scope-lemmas')}
              name='SEARCH_LEMMAS'
              checked={scopes.includes('SEARCH_LEMMAS')}
              onChange={handleChangeScope}
            />
            <Checkbox
              label={l10n.getString('search-box-scope-definitions')}
              name='SEARCH_DEFINITIONS'
              checked={scopes.includes('SEARCH_DEFINITIONS')}
              onChange={handleChangeScope}
            />
          </S.SearchScopes>
          <S.AdvancedSearch>
            <Button slim onClick={handleAdvancedSearch}>
              <Localized id='search-box-advanced-link'/>
            </Button>
          </S.AdvancedSearch>
        </S.SearchOptions>
        <SearchResultList
          results={results}
          currentIndex={currentIndex}
          query={searchedQuery}
          loading={loading}
          hasScopes={scopes.length > 0}
          scrollToCurrent={scrollToCurrent}
          onHover={onSelect}
          onClick={handleClickResult}
        />
      </S.Main>
    </S.Wrapper>
  );
};

export const searchDialog: DialogParams<Page | null> = {
  backdrop: true,
  pointerDownOutside: {value: null},
  // eslint-disable-next-line react/display-name
  render: props => <SearchDialog {...props}/>,
};

export const searchInLanguageDialog = (
  languageId: LanguageId,
  languageName: string
): DialogParams<Page | null> => ({
  backdrop: true,
  pointerDownOutside: {value: null},
  // eslint-disable-next-line react/display-name
  render: props =>
    <SearchDialog
      {...props}
      initialLanguage={{id: languageId, name: languageName}}
    />,
});
