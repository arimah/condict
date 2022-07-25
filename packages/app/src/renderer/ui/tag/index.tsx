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
  let target: Page;
  if (linkTo) {
    target = linkTo;
  } else {
    target = TagPage(id, name);
  }
  return (
    <S.Main to={target} {...otherProps}>
      <TagIcon/>
      {name}
    </S.Main>
  );
});

Tag.displayName = 'Tag';

export default Tag;
