import React, {ReactChild, Ref} from 'react';
import {Localized} from '@fluent/react';

import {ResourceIcon, intersperse} from '../../ui';

import HighlightedSnippet from './highlighted-snippet';
import {
  SearchResult,
  LemmaSearchResult,
  DefinitionSearchResult,
} from './types';
import * as S from './styles';

export type Props = {
  result: SearchResult;
  index: number;
  selected: boolean;
  onHover: (index: number) => void;
  onClick: (result: SearchResult) => void;
};

const Result = React.forwardRef((
  props: Props,
  ref: Ref<HTMLLIElement>
): JSX.Element => {
  const {result, index, selected, onHover, onClick} = props;

  let content: JSX.Element;
  switch (result.type) {
    case 'lemma':
      content = <LemmaContent result={result}/>;
      break;
    case 'definition':
      content = <DefinitionContent result={result}/>;
      break;
  }

  return (
    <S.Result
      $selected={selected}
      onMouseEnter={() => onHover(index)}
      onClick={() => onClick(result)}
      ref={ref}
    >
      <ResourceIcon type={result.type}/>
      {content}
    </S.Result>
  );
});

Result.displayName = 'Result';

export default Result;

type ContentProps<R extends SearchResult> = {
  result: R;
};

const LemmaContent = ({result}: ContentProps<LemmaSearchResult>): JSX.Element =>
  <>
    <S.ResultHeader>
      <S.ResultName>
        <HighlightedSnippet snippet={result.termSnippet}/>
      </S.ResultName>
      <S.ResultLanguage>
        {result.language.name}
      </S.ResultLanguage>
      <S.ResultType>
        <Localized id='search-box-result-type-lemma'/>
      </S.ResultType>
    </S.ResultHeader>
    <S.ResultBody>
      {intersperse(
        '; ',
        (result.partOfSpeechNames as ReactChild[])
          .concat(result.derivedFrom.map((dd, i) =>
            <Localized
              key={`derived-${i}`}
              id='search-box-result-derived-from'
              elems={{term: <i/>}}
              vars={dd as unknown as Record<string, string>}
            >
              <></>
            </Localized>
          ))
      )}
    </S.ResultBody>
  </>;

const DefinitionContent = (
  {result}: ContentProps<DefinitionSearchResult>
): JSX.Element =>
  <>
    <S.ResultHeader>
      <S.ResultName>
        {result.term}
        {' \u2014 '}
        <i>{result.partOfSpeechName}</i>
      </S.ResultName>
      <S.ResultLanguage>
        {result.language.name}
      </S.ResultLanguage>
      <S.ResultType>
        <Localized id='search-box-result-type-definition'/>
      </S.ResultType>
    </S.ResultHeader>
    <S.ResultBody>
      <HighlightedSnippet snippet={result.descriptionSnippet}/>
    </S.ResultBody>
  </>;
