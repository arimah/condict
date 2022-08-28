import styled from 'styled-components';

export const Main = styled.div`
  box-sizing: border-box;
  padding: 14px;
  position: fixed;
  z-index: 1;

  font-weight: normal;

  border: 2px solid var(--border-control);
  border-radius: 3px;
  background-color: var(--bg-control);
  color: var(--fg-control);
  box-shadow: var(--shadow-elevation-2);
  will-change: top, left;
`;

// Arrow transformations by orientation.
export const ArrowUp = 'translate(-50%, -50%) rotate(45deg)';
export const ArrowDown = 'translate(-50%, -50%) rotate(-135deg)';

// Arrow locations.
export const ArrowAbove = '0';
export const ArrowBelow = '100%';

export const Arrow = styled.div`
  box-sizing: border-box;
  position: absolute;
  width: 12px;
  height: 12px;
  top: ${ArrowAbove};

  border: 2px solid var(--bg-control);
  border-top-color: var(--border-control);
  border-left-color: var(--border-control);
  background-color: var(--bg-control);
  transform: ${ArrowUp};
`;
