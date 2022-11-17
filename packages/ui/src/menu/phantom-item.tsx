import React, {ReactNode, useContext} from 'react';
import ReactDOM from 'react-dom';

import {ShortcutName} from '../shortcut';

import getContainer from './container';
import {OwnerContext} from './context';
import {CheckType, PhantomProps} from './types';
import * as S from './styles';

const Checks: Record<CheckType, ReactNode> = {
  checkOn: <S.ItemCheck $radio={false} $checked={true}/>,
  checkOff: <S.ItemCheck $radio={false} $checked={false}/>,
  radioOn: <S.ItemCheck $radio={true} $checked={true}/>,
  radioOff: <S.ItemCheck $radio={true} $checked={false}/>,
  none: <S.ItemSubmenu/>,
};

const PhantomItem = React.memo((props: PhantomProps): JSX.Element => {
  const {
    x,
    y,
    width,
    height,
    icon,
    label,
    shortcut,
    checkType,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const owner = useContext(OwnerContext)!;

  return ReactDOM.createPortal(
    <S.PhantomContainer
      style={{
        top: `${y}px`,
        left: `${x}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      // Remove the phantom when it's phaded out.
      onAnimationEnd={() => owner.dispatch({type: 'removePhantom'})}
    >
      <S.Item>
        <S.ItemIcon>{icon}</S.ItemIcon>
        <S.ItemLabel>{label}</S.ItemLabel>
        {shortcut &&
          <S.ItemShortcut>
            <ShortcutName of={shortcut}/>
          </S.ItemShortcut>
        }
        {Checks[checkType]}
      </S.Item>
    </S.PhantomContainer>,
    getContainer()
  );
});

PhantomItem.displayName = 'PhantomItem';

export default PhantomItem;
