import styled, {css} from 'styled-components';
import {theme, switchProp} from 'styled-tools';

export interface AlignProps {
  alignX: 'center' | 'stretch';
  alignY: 'center' | 'stretch';
}

export const List = styled.div`
  margin: 16px;
`;

export const Row = styled.div`
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  > :not(:last-child) {
    margin-right: 16px;
  }
`;

export const ErrorContainer = styled.div`
  padding: 8px;
  border: 2px solid #c00;
  background-color: #fcc;
  color: #c00;
`;

export const ErrorMessage = styled.div`
  margin-bottom: 8px;
  font-weight: bold;
`;

export const ErrorStack = styled.pre`
  font-family: 'Consolas', 'Courier New', monospace;
  white-space: pre-wrap;
`;

export const Interactive = styled.div`
  display: flex;
  margin-top: 8px;
  margin-bottom: 16px;
  flex-direction: row;
`;

// Flexbox reminder: jusify-* = main axis; align-* = cross axis
// When `flex-direction: column`, main axis = y, cross axis = x.
export const InteractiveContents = styled.div.attrs({
  role: 'group',
  'aria-label': 'Interactive example',
})<AlignProps>`
  display: flex;
  flex: 1 1 auto;
  padding: 24px;
  flex-direction: column;
  border-radius: 8px;
  background-color: ${theme('general.bg')};

  ${switchProp('alignX', {
    center: css`
      align-items: center;
    `,
    stretch: css`
      align-items: stretch;
    `,
  })}

  ${switchProp('alignY', {
    center: css`
      justify-content: center;

      > * {
        flex-grow: 0;
      }
    `,
    stretch: css`
      justify-items: stretch;
    `,
  })}

  > ${List} {
    margin: 0;
  }
`;

export const InteractiveControls = styled.div.attrs({
  role: 'group',
  'aria-label': 'Interactive example settings',
})`
  padding: 16px;
  flex: 0 0 180px;
`;

export const InteractiveControl = styled.div`
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;
