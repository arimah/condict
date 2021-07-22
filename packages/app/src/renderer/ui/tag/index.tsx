import React from 'react';

import {TagId} from '../../graphql-shared';
import {TagPage} from '../../page';

import {Props as LinkProps} from '../link';
import {TagIcon} from '../resource-icons';

import * as S from './styles';

export type Props = {
  id: TagId;
  name: string;
} & Omit<LinkProps, 'id' | 'name' | 'to'>;

const Tag = React.memo((props: Props): JSX.Element => {
  const {id, name, ...otherProps} = props;
  return (
    <S.Main to={TagPage(id, name)} {...otherProps}>
      <TagIcon/>
      {name}
    </S.Main>
  );
});

Tag.displayName = 'Tag';

export default Tag;
