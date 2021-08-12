import styled from 'styled-components';

export const Main = styled.div`
  box-sizing: border-box;
  padding: 14px;
  position: fixed;
  z-index: 1;

  font-weight: normal;

  border: 2px solid ${p => p.theme.general.border};
  border-radius: 3px;
  background-color: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};
  box-shadow: ${p => p.theme.shadow.elevation2};
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

  border: 2px solid ${p => p.theme.general.bg};
  border-top-color: ${p => p.theme.general.border};
  border-left-color: ${p => p.theme.general.border};
  background-color: ${p => p.theme.general.bg};
  transform: ${ArrowUp};
`;
