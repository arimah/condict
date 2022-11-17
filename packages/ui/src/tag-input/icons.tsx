export type DeleteIconProps = {
  className?: string;
};

export const DeleteIcon = ({className}: DeleteIconProps): JSX.Element =>
  <svg className={className} width='8' height='8' viewBox='0 0 8 8'>
    <path
      d='M0,0 H1 L4,3 L7,0 H8 V1 L5,4 L8,7 V8 H7 L4,5 L1,8 H0 V7 L3,4 L0,1 z'
      fill='currentColor'
    />
  </svg>;
