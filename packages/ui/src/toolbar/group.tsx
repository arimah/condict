import React, {ReactNode, Ref, HTMLAttributes} from 'react';

import * as S from './styles';

export type Props = {
  name?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'aria-label'>;

const Group = React.forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
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
