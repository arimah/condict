import {ReactNode} from 'react';

import * as S from './styles';

export type Props = {
  title: ReactNode;
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export const Card = (props: Props): JSX.Element => {
  const {title, iconBefore, iconAfter, className, children} = props;
  return (
    <S.Card className={className}>
      {iconBefore}
      <div>
        <S.Title>{title}</S.Title>
        {children && <S.Content>{children}</S.Content>}
      </div>
      {iconAfter}
    </S.Card>
  );
};
