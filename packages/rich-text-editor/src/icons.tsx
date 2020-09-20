import React from 'react';
import {MdiReactIconProps} from 'mdi-react';

// Made to behave and look like MDI icons.

export const SearchIpaIcon = (props: MdiReactIconProps): JSX.Element => {
  const {className, color = 'currentColor', size = 24, ...otherProps} = props;
  return (
    <svg
      {...otherProps}
      className={`mdi-icon ${className || ''}`}
      width={size}
      height={size}
      fill={color}
      viewBox='0 0 24 24'
    >
      <path
        d='M22.39 14 L21 15.39 L17.88 12.32 C16.41 13.23 14.55 13.23 13.09 12.3 C11 10.97 10.35 8.19 11.69 6.08 C13 4 15.8 3.35 17.91 4.68 C20 6 20.64 8.79 19.31 10.9 Z
           M18 8.5 C18 7.119 16.881 6 15.5 6 C14.12 6 13 7.119 13 8.5 C13 9.881 14.12 11 15.5 11 C16.881 11 18 9.881 18 8.5 Z
           M4.23 17.59 L4.23 23.12 L1.88 23.12 L1.88 6.72 C1.88 5.27 2.31 4.13 3.16 3.28 C4 2.43 5.17 2 6.61 2 C8 2 9.07 2.34 9.87 3 C10.235 3.314 10.514 3.683 10.709 4.107 C9.648 5.264 9 6.806 9 8.5 C9 8.746 9.014 8.99 9.04 9.229 C8.795 9.371 8.532 9.488 8.25 9.58 L8.25 9.62 C8.562 9.67 8.857 9.735 9.133 9.817 C9.501 11.605 10.604 13.125 12.111 14.048 C12.045 15.229 11.588 16.206 10.75 16.97 C9.83 17.8 8.63 18.21 7.13 18.21 C6.07 18.21 5.1 18 4.23 17.59 Z
           M5.72 10.75 L5.72 8.83 C6.59 8.72 7.3 8.4 7.87 7.86 C8.43 7.31 8.71 6.7 8.71 6 C8.71 4.62 8 3.92 6.6 3.92 C5.84 3.92 5.25 4.16 4.84 4.65 C4.43 5.14 4.23 5.82 4.23 6.71 L4.23 15.5 C5.14 16.03 6.03 16.29 6.89 16.29 C7.73 16.29 8.39 16.07 8.86 15.64 C9.33 15.2 9.56 14.58 9.56 13.79 C9.56 12 8.28 11 5.72 10.75 Z'
      />
    </svg>
  );
};

export const ConvertToIpaIcon = (props: MdiReactIconProps): JSX.Element => {
  const {className, color = 'currentColor', size = 24, ...otherProps} = props;
  return (
    <svg
      {...otherProps}
      className={`mdi-icon ${className || ''}`}
      width={size}
      height={size}
      fill={color}
      viewBox='0 0 24 24'
    >
      <path
        d='M10 15 L10 9 L13 12 Z
           M6.5 12 C7.3 12 8 12.7 8 13.5 L8 15 C8 16.105 7.105 17 6 17 L2 17 L2 7 L6 7 C7.105 7 8 7.895 8 9 L8 10.5 C8 11.3 7.3 12 6.5 12 Z
           M6 13 L4 13 L4 15 L6 15 Z
           M6 9 L4 9 L4 11 L6 11 Z
           M19 5 C20.65 5 22 6.36 22 8 L22 9 C22 9.82 21.59 10.54 21 11 C21.59 11.46 22 12.18 22 13 L22 14 C22 15.65 20.65 17 19 17 L17 17 L17 20 L15 20 L15 8 C15 6.36 16.36 5 18 5 Z
           M17 15 L19 15 C19.57 15 20 14.57 20 14 L20 13 C20 12.43 19.57 12 19 12 L18 12 L18 10 L19 10 C19.57 10 20 9.57 20 9 L20 8 C20 7.43 19.57 7 19 7 L18 7 C17.43 7 17 7.43 17 8 Z'
      />
    </svg>
  );
};
