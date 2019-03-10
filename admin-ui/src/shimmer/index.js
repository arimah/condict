import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import * as S from './styles';

export const Shimmer = ({state: {visible, x, y}}) =>
  <S.Shimmer
    visible={visible}
    ref={elem => {
      // Measurements show constructing the `style` object and having React
      // do its thing to it is actually very slightly too slow for real-time.
      // This seems to produce a smoother framerate more consistently.
      if (elem && visible) {
        elem.style.top = `${y}px`;
        elem.style.left = `${x}px`;
      }
    }}
  />;

Shimmer.propTypes = {
  state: PropTypes.shape({
    visible: PropTypes.bool.isRequired,
    x: PropTypes.number,
    y: PropTypes.number,
  }).isRequired,
};

const InitialState = Object.freeze({
  visible: false,
});

export const useShimmer = (elemRef) => {
  const [state, setState] = useState(InitialState);

  // Normally we would rely entirely on React's event handling to magic things
  // for us. Unfortunately, React attaches event handlers globally, and for
  // mouse events, that has unpleasant performance implications. In this case,
  // given that there will be *relatively* few (no more than ~100s, certainly)
  // buttons and other hoverable elements, it feels acceptable to attach the
  // event handlers directly to the element.
  useEffect(() => {
    const elem = elemRef.current;

    const enterAndMove = e => setState({
      visible: true,
      x: e.offsetX,
      y: e.offsetY,
    });
    const leave = e => setState({
      visible: false,
      // Make sure to retain the position, so it doesn't flop about
      // while fading out.
      x: state.x,
      y: state.y,
    });
    elem.addEventListener('mouseenter', enterAndMove);
    elem.addEventListener('mousemove', enterAndMove);
    elem.addEventListener('mouseleave', leave);

    return () => {
      elem.removeEventListener('mouseenter', enterAndMove);
      elem.removeEventListener('mousemove', enterAndMove);
      elem.removeEventListener('mouseleave', leave);
    };
  }, [elemRef.current]);

  return state;
};
