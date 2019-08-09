import React, {ReactNode, SelectHTMLAttributes} from 'react';

import * as S from './styles';

export type Props = {
  value?: string | number;
  options?: Option[];
} & S.Props & Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value'
>;

export interface Option {
  value: string | number;
  name: ReactNode;
}

const renderOptions = (
  children: ReactNode,
  options: Option[] | undefined
): ReactNode => {
  if (process.env.NODE_ENV === 'development' && children && options) {
    // eslint-disable-next-line no-console
    console.warn(
      '<Select> should have either children or options, not both! Children will take precedence.'
    );
    // eslint-disable-next-line no-console
    console.trace();
  }

  if (children) {
    return children;
  }
  if (options) {
    return options.map(opt =>
      <option key={opt.value} value={opt.value}>
        {opt.name}
      </option>
    );
  }

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(
      '<Select> has no children. This can have negative usability and accessibility implications.'
    );
    // eslint-disable-next-line no-console
    console.trace();
  }
  return null;
};

export const Select = React.forwardRef<HTMLSelectElement, Props>((
  props: Props,
  ref
) => {
  const {
    className,
    options,
    disabled = false,
    children,
    minimal = false,
    ...otherProps
  } = props;

  return (
    <S.Wrapper className={className}>
      <S.Select
        {...otherProps}
        minimal={minimal}
        disabled={disabled}
        ref={ref}
      >
        {renderOptions(children, options)}
      </S.Select>
      <S.Arrow disabled={disabled}>
        <path d='M0 2 H8 L4 8 Z' fill='currentColor'/>
      </S.Arrow>
    </S.Wrapper>
  );
});

Select.displayName = 'Select';
