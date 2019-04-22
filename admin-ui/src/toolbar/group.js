import React from 'react';
import PropTypes from 'prop-types';

import * as S from './styles';

const Group = React.forwardRef((props, ref) => {
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

Group.propTypes = {
  name: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Group.defaultProps = {
  name: undefined,
};

export default Group;
