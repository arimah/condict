import styled from 'styled-components';

export const Main = styled.div.attrs({
  role: 'alert',
})`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export type ContentProps = {
  small?: boolean;
};

export const Content = styled.span<ContentProps>`
  margin-inline-start: ${p => p.small ? '8px' : '16px'};
`;
