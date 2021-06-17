import styled from 'styled-components';

export type ContainerProps = {
  active: boolean;
};

export const Container = styled.div<ContainerProps>`
  box-sizing: border-box;
  display: grid;
  padding: 32px;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  justify-items: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: ${p => p.active ? 'auto' : 'none'};

  > * {
    grid-row: 1;
    grid-column: 1;
  }
`;
