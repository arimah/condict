import styled from 'styled-components';

export type AlignProps = {
  alignX: 'center' | 'stretch';
  alignY: 'center' | 'stretch';
};

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

const AlignXValues = {
  center: 'align-items: center;',
  stretch: 'align-items: stretch;',
};

const AlignYValues = {
  center: `
    justify-content: center;
    > * {
      flex-grow: 0;
    }
  `,
  stretch: 'justify-items: stretch;',
};

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
  background-color: ${p => p.theme.general.bg};

  ${p => AlignXValues[p.alignX]}

  ${p => AlignYValues[p.alignY]}

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
