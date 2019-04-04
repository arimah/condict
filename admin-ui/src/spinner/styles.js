import styled, {keyframes} from 'styled-components';
import {prop} from 'styled-tools';

const SpinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const Main = styled.span`
  display: block;
  position: relative;
  width: ${prop('size')}px;
  height: ${prop('size')}px;
`;

export const Slice = styled.span`
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  border: ${p => Math.ceil(Math.min(25, p.size / 8))}px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;

  opacity: ${p => (3 - p.number) / 3};

  animation: ${SpinAnimation} 1s cubic-bezier(0.4, 0.1, 0.6, 0.9) infinite;
  animation-delay: ${p => 150 * p.number}ms;
`;
