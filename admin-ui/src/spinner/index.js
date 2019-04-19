import React from 'react';
import PropTypes from 'prop-types';

import * as S from './styles';

export const Spinner = React.forwardRef((props, ref) => {
  const {className, size} = props;

  const sliceStyle = {
    borderWidth: Math.ceil(Math.min(25, size / 8)),
  };

  return (
    <S.Main
      className={className}
      style={{width: size, height: size}}
      ref={ref}
    >
      <S.Slice style={sliceStyle} number={0}/>
      <S.Slice style={sliceStyle} number={1}/>
      <S.Slice style={sliceStyle} number={2}/>
    </S.Main>
  );
});

Spinner.displayName = 'Spinner';

Spinner.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
};

Spinner.defaultProps = {
  className: '',
  size: 24,
};
