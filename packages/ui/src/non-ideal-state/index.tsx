import React, {ReactNode} from 'react';
import PropTypes from 'prop-types';

import * as S from './styles';

export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

export type Props = {
  className?: string;
  image: ReactNode;
  title: ReactNode;
  headingLevel: HeadingLevel;
  description: ReactNode;
  action: ReactNode;
} & S.Props;

type HeadingTag = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const getHeadingTag = (level: HeadingLevel): HeadingTag => {
  switch (level) {
    case 2: return 'h2';
    case 3: return 'h3';
    case 4: return 'h4';
    case 5: return 'h5';
    case 6: return 'h6';
  }
}

export const NonIdealState = React.forwardRef<HTMLDivElement, Props>((
  props: Props,
  ref
) => {
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
      <S.Title as={getHeadingTag(headingLevel)}>{title}</S.Title>
      {description && <S.Description>{description}</S.Description>}
      {action && <S.Action>{action}</S.Action>}
    </S.Main>
  );
});

NonIdealState.displayName = 'NonIdealState';

NonIdealState.defaultProps = {
  className: '',
  minimal: false,
  image: undefined,
  headingLevel: 2,
  description: undefined,
  action: undefined,
};
