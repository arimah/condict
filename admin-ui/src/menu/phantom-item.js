import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import getContainer from './container';
import * as S from './styles';

const nextTick = fn => window.setTimeout(() => fn(), 0);

const PhantomWrapper = props => {
  const {
    top,
    left,
    width,
    height,
    renderItem,
  } = props;

  const [opacity, setOpacity] = useState('1');
  const containerRef = useRef();
  useEffect(() => {
    nextTick(() => setOpacity('0'));
  }, []);

  return ReactDOM.createPortal(
    <S.PhantomContainer
      style={{top, left, width, height, opacity}}
      ref={containerRef}
    >
      {renderItem()}
    </S.PhantomContainer>,
    getContainer()
  );
};

PhantomWrapper.propTypes = {
  top: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
};

export default PhantomWrapper;
