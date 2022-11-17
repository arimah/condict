import styled from 'styled-components';

export const Main = styled.div.attrs({
  role: 'alert',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Content = styled.span<{
  $small?: boolean;
}>`
  margin-inline-start: ${p => p.$small ? '8px' : '16px'};
`;
