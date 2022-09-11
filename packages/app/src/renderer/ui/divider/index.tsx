import {ReactNode} from 'react';

import * as S from './styles';

export type Props = {
  children?: ReactNode;
};

const Divider = (props: Props): JSX.Element => {
  const {children} = props;
  return (
    <S.Divider>
      {children && <span>{children}</span>}
    </S.Divider>
  );
};

export default Divider;
