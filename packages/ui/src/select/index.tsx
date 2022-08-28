import React, {ReactNode, Ref, SelectHTMLAttributes} from 'react';

import * as S from './styles';

export type Props = {
  value?: string;
  defaultValue?: string;
  options?: readonly Option[];
} & S.Props & Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'defaultValue'
>;

export type Option = {
  readonly value: string;
  readonly name: ReactNode;
};

export const Select = React.forwardRef((
  props: Props,
  ref: Ref<HTMLSelectElement>
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
      <S.Arrow>
        <path d='M0,1 H8 L4,7 Z' fill='currentColor'/>
      </S.Arrow>
    </S.Wrapper>
  );
});

Select.displayName = 'Select';

const renderOptions = (
  children: ReactNode,
  options: readonly Option[] | undefined
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
