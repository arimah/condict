import React, {HTMLAttributes, ReactNode} from 'react';

import * as S from './styles';

export type Props = {
  name?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'>;

const Group = React.forwardRef<HTMLDivElement, Props>((
  props: Props,
  ref
) => {
  const {
    name,
    children,
    ...otherProps
  } = props;

  return (
    <S.Group
      {...otherProps}
      aria-label={name}
      ref={ref}
    >
      {children}
    </S.Group>
  );
});

Group.displayName = 'Group';

export default Group;
