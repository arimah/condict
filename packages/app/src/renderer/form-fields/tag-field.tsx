import React, {ReactNode, useCallback} from 'react';
import {useLocalization} from '@fluent/react';

import {FieldInput, FieldInputProps, useUniqueId} from '@condict/ui';

import {useExecute} from '../data';
import {OperationResult, TagId} from '../graphql';
import {useNearestForm, useField, useFormState} from '../form';
import {useTagFieldMessages} from '../hooks';

import {SearchTagsQuery} from './query';
import * as S from './styles';

export type Props = {
  name: string;
  path?: string;
  label?: ReactNode;
  errorMessage?: ReactNode;
} & Omit<
  FieldInputProps<string>,
  | 'mode'
  | 'values'
  | 'getKey'
  | 'getName'
  | 'getTag'
  | 'tags'
  | 'knownValues'
  | 'aria-label'
  | 'aria-labelledby'
  | 'messages'
  | 'onChange'
  | 'onSearch'
>;

export interface TagValue {
  readonly id: TagId | null;
  readonly name: string;
}

// eslint-disable-next-line react/display-name
export const TagField = React.memo((props: Props): JSX.Element => {
  const {
    name,
    path,
    label,
    readOnly,
    errorMessage,
    ...otherProps
  } = props;

  const {l10n} = useLocalization();

  const form = useNearestForm();

  const id = useUniqueId();

  const {isSubmitting} = useFormState(form);
  const field = useField<TagValue[]>(form, name, {path});

  const execute = useExecute();
  const handleSearch = useCallback(async (
    query: string
  ): Promise<TagValue[]> => {
    const data = await execute(SearchTagsQuery, {query});
    if (data.errors || !data.data || !data.data.search) {
      if (data.errors) {
        console.error('Received GraphQL error:', data.errors);
      }
      return [];
    }
    const {search, tag} = data.data;
    const results = search.nodes.map(convertSearchResult);
    // If there is *not* an existing tag that exactly matches the query, then
    // we add it at the start as a new tag. We don't have to check if the query
    // is all white space - onSearch is not called on all white space input.
    if (!tag) {
      results.unshift({id: null, name: query});
    }
    return results;
  }, [execute]);

  const getTag = useCallback(
    (tag: TagValue): string | null =>
      tag.id === null ? l10n.getString('tag-input-new-tag') : null,
    [l10n]
  );

  const messages = useTagFieldMessages();

  return (
    <S.Field>
      {label &&
        <S.Label as='span' id={`${id}-label`}>
          {label}
        </S.Label>}
      <FieldInput
        {...otherProps}
        values={field.value}
        getName={getNameOrKey}
        getKey={getNameOrKey}
        getTag={getTag}
        readOnly={readOnly || isSubmitting}
        messages={messages}
        onChange={field.set}
        onSearch={handleSearch}
      />
      {errorMessage &&
        <S.ErrorMessage id={`${id}-error`}>
          {errorMessage}
        </S.ErrorMessage>}
    </S.Field>
  );
});

const getNameOrKey = (tag: TagValue): string => tag.name;

type GqlSearchResults = NonNullable<
  OperationResult<typeof SearchTagsQuery>['search']
>['nodes'];

type GqlSearchResult = GqlSearchResults extends (infer R)[] ? R : never;

const convertSearchResult = (result: GqlSearchResult): TagValue => {
  switch (result.__typename) {
    case 'TagSearchResult':
      return result.tag;
    default:
      throw new Error(`Unexpected search result type: ${result.__typename}`);
  }
};
