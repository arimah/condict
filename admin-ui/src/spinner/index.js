import React from 'react';
import PropTypes from 'prop-types';

import * as S from './styles';

export const Spinner = React.forwardRef((props, ref) => {
  const {className, size} = props;

  return (
    <S.Main className={className} size={size} ref={ref}>
      <S.Slice size={size} number={0}/>
      <S.Slice size={size} number={1}/>
      <S.Slice size={size} number={2}/>
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
