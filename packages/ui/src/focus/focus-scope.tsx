import React from 'react';

import combineRefs from '../combine-refs';

import {useManagedFocus} from './manager';
import {ElementChild, FocusScopeBehavior} from './types';

export type Props = {
  active?: boolean;
  children: ElementChild;
};

const getBehavior = (active: boolean) =>
  active ? FocusScopeBehavior.NORMAL : FocusScopeBehavior.EXCLUDE;

const FocusScope = (props: Props): JSX.Element => {
  const {
    active = true,
    children,
  } = props;

  const rootRef = useManagedFocus({
    behavior: getBehavior(active),
  });

  const childWithRef = React.cloneElement(children, {
    ref: combineRefs(rootRef, children.ref),
  });
  return childWithRef;
};

export default FocusScope;
