import {ReactNode} from 'react';

import {Page} from '../../page';

import * as S from './styles';

export type Props = {
  to: Page;
  title: ReactNode;
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export const LinkCard = (props: Props): JSX.Element => {
  const {to, title, iconBefore, iconAfter, className, children} = props;
  return (
    <S.LinkCard to={to} className={className}>
      {iconBefore}
      <div>
        <S.Title>{title}</S.Title>
        <S.Content>{children}</S.Content>
      </div>
      {iconAfter}
    </S.LinkCard>
  );
};
