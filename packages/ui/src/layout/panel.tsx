import {HTMLAttributes} from 'react';
import styled, {css} from 'styled-components';

export type Props = {
  minimal?: boolean;
  raised?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const Panel = styled.div<Props>`
  margin-top: 8px;
  margin-bottom: 8px;

  ${p => p.minimal ? `
    padding: 16px;
    borded-width: 0;
  ` : css`
    padding: 14px;
    border: 2px solid ${p => p.theme.general.border};
  `}

  border-radius: 3px;
  box-shadow: ${p => p.raised && p.theme.shadow.elevation1};

  /* Panel is not focusable by default, but make sure it supports tabindex. */
  &:focus,
  &.force-focus {
    outline: none;
    padding: 14px;
    border: 2px solid ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  }

  > :first-child {
    margin-top: 0;
  }

  > :last-child {
    margin-bottom: 0;
  }
`;

export default Panel;
