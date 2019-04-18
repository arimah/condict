import React, {useContext} from 'react';
import PropTypes from 'prop-types';

import Placement from '../placement';

import {StackContext} from './context';
import ManagedMenu from './managed-menu';
import Item from './item';
import CheckItem from './check-item';
import Separator from './separator';

export const Menu = React.forwardRef((props, ref) => {
  const {children, ...otherProps} = props;
  const stack = useContext(StackContext);
  if (process.env.NODE_ENV === 'development' && !stack) {
    throw new Error('Menu must be mounted inside a MenuManager!');
  }
  return (
    <ManagedMenu {...otherProps} stack={stack} ref={ref}>
      {children}
    </ManagedMenu>
  );
});
Menu.displayName = 'Menu';

Menu.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  placement: PropTypes.oneOf(Object.values(Placement)),
  parentRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
  children: PropTypes.any.isRequired,
};

Menu.defaultProps = {
  id: undefined,
  name: undefined,
  placement: Placement.BELOW_LEFT,
  parentRef: undefined,
};

Object.assign(Menu, {
  Item,
  CheckItem,
  Separator,
});
