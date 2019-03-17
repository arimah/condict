import styled from 'styled-components';
import {ifProp} from 'styled-tools';

export const Shimmer = styled.span`
  display: block;
  position: absolute;
  pointer-events: none;

  margin-top: -140px;
  margin-left: -140px;
  width: 280px;
  height: 280px;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.175) 25px,
    rgba(255, 255, 255, 0.05) 70px,
    rgba(255, 255, 255, 0) 140px
  );

  opacity: ${ifProp('visible', '1', '0')};

  transition: opacity linear 100ms;
`;
