import styled from 'styled-components';
import {ifProp} from 'styled-tools';

export const Shimmer = styled.span`
  display: block;
  position: absolute;
  pointer-events: none;

  margin-top: -90px;
  margin-left: -90px;
  width: 180px;
  height: 180px;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.15) 25px,
    rgba(255, 255, 255, 0) 90px
  );

  opacity: ${ifProp('visible', '1', '0')};

  transition: opacity linear 100ms;
`;
