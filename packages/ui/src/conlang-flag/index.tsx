import React from 'react';
import PropTypes from 'prop-types';

export interface Props {
  className: string;
  width: number;
  height: number;
}

export const ConlangFlag = React.forwardRef<SVGSVGElement, Props>((
  {className, width, height}: Props,
  ref
) =>
  <svg
    className={className}
    width={width}
    height={height}
    viewBox='0 0 647 400'
    preserveAspectRatio='xMidYMid meet'
    ref={ref}
  >
    <rect fill='#ffb700' width='647' height='400'/>
    <path
      fill='#91008c'
      d='M164,217.5 C164,134.381 235.41,67 323.499,67 C411.588,67 483,134.381 483,217.5 c0,17.237 -3.08,33.793 -8.733,49.216 c56.384,6.346 125.523,22.21 172.733,40.98 V0 H0 v307.696 c47.21,-18.771 116.349,-34.635 172.733,-40.98 C167.08,251.293 164,234.737 164,217.5 z'
    />
    <path
      fill='#000000'
      d='
        M647,400 v-75.19 c-50.633,-18.434 -129.049,-33.617 -177.764,-37.472 l-8.537,-23.174 l-284.44,24.178 c-5.277,-0.034 -9.98,0.047 -12.916,0.369 C114.602,294.064 45.89,308.104 0,324.813 V400 H647 z
        M355.053,163.375 L291.948,163.375 L287.394,174.191 L357.12,168.613 z
        M275.929,179.498 L270.213,193.073 L371.83,183.537 L366.844,172.225 z
        M256.929,198.713 L250.382,212.162 L385.309,199.085 L379.976,187.166 z
        M236.102,217.942 L228.64,235.392 L403.229,217.933 L395.703,202.474 z
        M213.147,241.338 L205.391,258.182 L423.086,237.249 L416.872,220.966 z
        M213.147,241.338 L205.391,258.182 L423.086,237.249 L416.872,220.966 z
        M188.114,264.238 L179.149,283.705 L443.194,261.261 L434.67,240.531 z
      '
    />
  </svg>
);

ConlangFlag.displayName = 'ConlangFlag';

ConlangFlag.defaultProps = {
  className: '',
  width: 94,
  height: 58,
};
