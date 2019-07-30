import React from 'react';
import PropTypes from 'prop-types';

import * as S from './styles';

export const NonIdealState = React.forwardRef((props, ref) => {
  const {
    className,
    minimal,
    image,
    title,
    headingLevel,
    description,
    action,
  } = props;

  return (
    <S.Main
      className={className}
      minimal={minimal}
      ref={ref}
    >
      {image && <S.Image>{image}</S.Image>}
      <S.Title as={`h${headingLevel}`}>{title}</S.Title>
      {description && <S.Description>{description}</S.Description>}
      {action && <S.Action>{action}</S.Action>}
    </S.Main>
  );
});

NonIdealState.displayName = 'NonIdealState';

NonIdealState.propTypes = {
  className: PropTypes.string,
  minimal: PropTypes.bool,
  image: PropTypes.node,
  title: PropTypes.node.isRequired,
  headingLevel: PropTypes.oneOf([2, 3, 4, 5, 6]),
  description: PropTypes.node,
  action: PropTypes.node,
};

NonIdealState.defaultProps = {
  className: '',
  minimal: false,
  image: undefined,
  headingLevel: 2,
  description: undefined,
  action: undefined,
};
