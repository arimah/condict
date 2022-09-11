import React from 'react';

import {TagId} from '../../graphql';
import {Page, TagPage} from '../../page';

import {Props as LinkProps} from '../link';
import {TagIcon} from '../resource-icons';

import * as S from './styles';

export type Props = (IdProps | LinkTargetProps) & {
  name: string;
} & Omit<LinkProps, 'id' | 'name' | 'to'>;

type IdProps = {
  id: TagId;
  linkTo?: undefined;
};

type LinkTargetProps = {
  id?: undefined;
  linkTo: Page;
};

const Tag = React.memo((props: Props): JSX.Element => {
  const {id, linkTo, name, ...otherProps} = props;
  const target = linkTo ?? TagPage(id, name);
  return (
    <S.Tag to={target} {...otherProps}>
      <TagIcon/>
      {name}
    </S.Tag>
  );
});

Tag.displayName = 'Tag';

export default Tag;

export interface TagData {
  readonly id: TagId;
  readonly name: string;
}

export type TagListProps<T extends TagData> = {
  tags: readonly T[];
  target?: (tag: T) => Page;
};

export interface TagListComponent {
  <T extends TagData>(
    props: TagListProps<T>
  ): JSX.Element;

  displayName?: string;
}

export const TagList = React.memo((
  props: TagListProps<TagData>
): JSX.Element => {
  const {tags, target = defaultTarget} = props;
  return (
    <S.TagList>
      {tags.map(tag =>
        <li key={tag.id}>
          <Tag
            linkTo={target(tag)}
            name={tag.name}
          />
        </li>
      )}
    </S.TagList>
  );
}) as TagListComponent;

TagList.displayName = 'TagList';

const defaultTarget = (tag: TagData) => TagPage(tag.id, tag.name);
