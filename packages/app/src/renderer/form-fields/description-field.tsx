import React, {ReactNode, useCallback} from 'react';
import {FieldValues, FieldPath, useController} from 'react-hook-form';
import {Localized} from '@fluent/react';

import {useUniqueId} from '@condict/ui';
import {
  DescriptionEditorProps,
  BlockElement,
  SearchResult,
} from '@condict/rich-text-editor';

import {useExecute} from '../data';
import {OperationResult} from '../graphql';
import {useRichTextEditorMessages} from '../hooks';
import {HighlightedSnippet} from '../ui';

import {LinkTargetQuery} from './query';
import * as S from './styles';

export type Props<D extends FieldValues> = {
  name: FieldPath<D>;
  label?: ReactNode;
  defaultValue?: BlockElement[];
  errorMessage?: ReactNode;
} & Omit<
  DescriptionEditorProps,
  | 'value'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'messages'
  | 'onChange'
  | 'onFindLinkTarget'
  | 'onFocus'
  | 'onBlur'
>;

export type DescriptionFieldComponent = <D extends FieldValues>(
  props: Props<D>
) => JSX.Element;

// eslint-disable-next-line react/display-name
export const DescriptionField = React.memo((
  props: Props<FieldValues>
): JSX.Element => {
  const {name, label, defaultValue, errorMessage, ...otherProps} = props;

  const id = useUniqueId();
  const execute = useExecute();

  const {field, formState} = useController({name, defaultValue});
  const {onChange, onBlur} = field;
  const {isSubmitting} = formState;
  const value = field.value as BlockElement[];

  const messages = useRichTextEditorMessages();

  const handleFindLinkTarget = useCallback(async (
    query: string
  ): Promise<readonly SearchResult[]> => {
    const data = await execute(LinkTargetQuery, {query});
    if (data.errors || !data.data || !data.data.search) {
      if (data.errors) {
        console.error('Received GraphQL error:', data.errors);
      }
      return [];
    }
    const results = data.data.search.nodes;
    return results.map(convertSearchResult);
  }, [execute]);

  return (
    <S.Field>
      {label &&
        <S.Label as='span' id={`${id}-label`}>
          {label}
        </S.Label>}
      <S.DescriptionEditor
        {...otherProps}
        value={value}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        readOnly={isSubmitting}
        messages={messages}
        onChange={onChange}
        onFindLinkTarget={handleFindLinkTarget}
        onBlur={onBlur}
      />
      {errorMessage &&
        <S.ErrorMessage id={`${id}-error`}>
          {errorMessage}
        </S.ErrorMessage>}
    </S.Field>
  );
}) as DescriptionFieldComponent;

type GqlSearchResults = NonNullable<
  OperationResult<typeof LinkTargetQuery>['search']
>['nodes'];

type GqlSearchResult = GqlSearchResults extends (infer R)[] ? R : never;

const convertSearchResult = (result: GqlSearchResult): SearchResult => {
  switch (result.__typename) {
    case 'LanguageSearchResult':
      return {
        name: <HighlightedSnippet snippet={result.nameSnippet}/>,
        target: {
          type: 'language',
          url: `condict://language/${result.language.id}`,
          name: result.language.name,
        },
      };
    case 'LemmaSearchResult':
      return {
        name: <HighlightedSnippet snippet={result.termSnippet}/>,
        snippet:
          <i>
            <Localized
              id='rich-text-link-search-lemma-description'
              vars={{language: result.lemma.language.name}}
            />
          </i>,
        target: {
          type: 'headword',
          url: `condict://lemma/${result.lemma.id}`,
          name: result.lemma.term,
        },
      };
    case 'DefinitionSearchResult':
      return {
        name: <>
          {result.definition.term}
          {' – '}
          <i>{result.definition.partOfSpeech.name}</i>
        </>,
        snippet: <>
          <p>
            <HighlightedSnippet snippet={result.descriptionSnippet}/>
          </p>
          <p>
            <i>
              <Localized
                id='rich-text-link-search-definition-description'
                vars={{language: result.definition.language.name}}
              />
            </i>
          </p>
        </>,
        target: {
          type: 'definition',
          url: `condict://definition/${result.definition.id}`,
          name: result.definition.term,
        },
      };
    case 'PartOfSpeechSearchResult':
      return {
        name: <HighlightedSnippet snippet={result.nameSnippet}/>,
        snippet:
          <i>
            <Localized
              id='rich-text-link-search-part-of-speech-description'
              vars={{language: result.partOfSpeech.language.name}}
            />
          </i>,
        target: {
          type: 'part of speech',
          url: `condict://part-of-speech/${result.partOfSpeech.id}`,
          name: result.partOfSpeech.name,
        },
      };
    default:
      throw new Error(`Unexpected search result type: ${result.__typename}`);
  }
};
