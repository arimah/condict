import {HTMLAttributes} from 'react';

import * as S from './styles';

export type Props = {
  maxLines: number;
  expanded?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const ClampedBodyText = (props: Props): JSX.Element => {
  const {maxLines, expanded = false, children, ...otherProps} = props;
  return (
    <S.Main
      {...otherProps}
      style={{...props.style, WebkitLineClamp: maxLines}}
      expanded={expanded}
    >
      {children}
    </S.Main>
  );
};

export default ClampedBodyText;
