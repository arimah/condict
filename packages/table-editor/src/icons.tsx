import React, {SVGAttributes} from 'react';

export type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  'width' | 'height' | 'viewBox'
>;

export const DoNotDeriveLemmaIcon = React.forwardRef<SVGSVGElement, Props>((
  props: Props,
  ref
) =>
  <svg
    {...props}
    width='9' height='9' viewBox='0 0 9 9'
    ref={ref}
  >
    <title>This form will not be added to the dictionary</title>
    <circle cx='4.5' cy='4.5' r='4' fill='#E53935'/>
  </svg>
);

DoNotDeriveLemmaIcon.displayName = 'DoNotDeriveLemmaIcon';

export const CustomDisplayNameIcon = React.forwardRef<SVGSVGElement, Props>((
  props: Props,
  ref
) =>
  <svg
    {...props}
    width='9' height='9' viewBox='0 0 90 90'
    ref={ref}
  >
    <title>This form has a custom name</title>
    <path
      d='M0,90 L0,85 L8,59 L63,4 C67,0 73,0 77,4 L86,13 C90,17 90,23 86,27 L31,82 L5,90 z'
      fill='#9C27B0'
    />
  </svg>
);

CustomDisplayNameIcon.displayName = 'CustomDisplayNameIcon';
