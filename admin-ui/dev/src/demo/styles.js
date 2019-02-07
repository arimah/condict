import styled from 'styled-components';
import {theme} from 'styled-tools';

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

export const InteractiveContents = styled.div.attrs({
  role: 'group',
  'aria-label': 'Interactive example',
})`
  display: flex;
  flex: 1 0 auto;
  padding: 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: ${theme('general.bg')};

  > * {
    flex-grow: 0;
  }

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
