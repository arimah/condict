export type IconProps = {
  className?: string;
};

export const CloseIcon = (): JSX.Element =>
  <svg className='close-icon' viewBox='0 0 16 16' width='16' height='16'>
    <path
      fill='currentColor'
      d='M3,11.8 L6.8,8 3,4.2 4.2,3 8,6.8 11.8,3 13,4.2 9.2,8 13,11.8 11.8,13 8,9.2 4.2,13 z'
    />
  </svg>;

export const DirtyIcon = (): JSX.Element =>
  <svg className='dirty-icon' viewBox='0 0 16 16' width='16' height='16'>
    <circle fill='currentColor' cx='8' cy='8' r='5'/>
  </svg>;
