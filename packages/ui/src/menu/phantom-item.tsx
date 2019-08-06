import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import getContainer from './container';
import * as S from './styles';

const nextTick = (fn: () => void) => window.setTimeout(() => fn(), 0);

export interface Props {
  top: number;
  left: number;
  width: number;
  height: number;
  renderItem: () => JSX.Element;
}

const PhantomWrapper = (props: Props) => {
  const {
    top,
    left,
    width,
    height,
    renderItem,
  } = props;

  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    nextTick(() => setOpacity(0));
  }, []);

  return ReactDOM.createPortal(
    <S.PhantomContainer style={{top, left, width, height, opacity}}>
      {renderItem()}
    </S.PhantomContainer>,
    getContainer()
  );
};

export default PhantomWrapper;
