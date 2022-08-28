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
    margin-inline-end: 16px;
  }
`;

export const Outer = styled.div`
  display: flex;
  margin-block: 8px 16px;
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
export const Main = styled.div.attrs({
  role: 'group',
  'aria-label': 'Interactive example',
})<AlignProps>`
  display: flex;
  flex: 1 1 auto;
  padding: 24px;
  flex-direction: column;
  border-radius: 8px;
  background-color: var(--bg);

  ${p => AlignXValues[p.alignX]}

  ${p => AlignYValues[p.alignY]}

  > ${List} {
    margin: 0;
  }
`;

export const Controls = styled.div.attrs({
  role: 'group',
  'aria-label': 'Interactive example settings',
})`
  padding: 16px;
  flex: 0 0 200px;
`;

export const Control = styled.div`
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;
