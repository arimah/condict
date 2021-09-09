import styled from 'styled-components';

export const Panel = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;

  padding: 14px;
  border: 2px solid ${p => p.theme.general.border};

  border-radius: 7px;

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
