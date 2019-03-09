import React, {useState, useMemo} from 'react';
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

export const useShimmer = () => {
  const [state, setState] = useState(InitialState);
  const events = useMemo(() => {
    const enterAndMove = e => setState({
      visible: true,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });

    return {
      enter: enterAndMove,
      move: enterAndMove,
      leave: e => setState({
        visible: false,
        // Make sure to retain the position, so it doesn't flop about
        // while fading out.
        x: state.x,
        y: state.y,
      }),
    };
  }, []);

  return {state, events};
};
