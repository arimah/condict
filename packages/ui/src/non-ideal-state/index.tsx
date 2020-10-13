import React, {ReactNode} from 'react';

import {useUniqueId} from '../unique-id';

import * as S from './styles';

export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

export type Props = {
  className?: string;
  image?: ReactNode;
  title: ReactNode;
  headingLevel?: HeadingLevel;
  description?: ReactNode;
  action?: ReactNode;
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
};

export const NonIdealState = React.forwardRef<HTMLDivElement, Props>((
  props: Props,
  ref
) => {
  const {
    className,
    minimal,
    image,
    title,
    headingLevel = 2,
    description,
    action,
  } = props;

  const id = useUniqueId();

  return (
    <S.Main
      className={className}
      minimal={minimal}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      // If the component has no actions, make the outer element focusable,
      // so it can be discovered by screen readers.
      tabIndex={!action ? 0 : undefined}
      ref={ref}
    >
      {image && <S.Image>{image}</S.Image>}
      <S.Title as={getHeadingTag(headingLevel)} id={`${id}-title`}>
        {title}
      </S.Title>
      {description &&
        <S.Description id={`${id}-desc`}>{description}</S.Description>}
      {action && <S.Action>{action}</S.Action>}
    </S.Main>
  );
});

NonIdealState.displayName = 'NonIdealState';
