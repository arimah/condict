import React, {
  ReactNode,
  Ref,
  ChangeEvent,
  RefAttributes,
  SelectHTMLAttributes,
  useCallback,
} from 'react';

import * as S from './styles';

export type Props<T> = {
  value: T;
  options: readonly Option<T>[];
  minimal?: boolean;
  onChange: (value: T, event: ChangeEvent<HTMLSelectElement>) => void;
} & Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  | 'value'
  | 'defaultValue'
  | 'multiple'
  | 'onChange'
  | 'children'
> & RefAttributes<HTMLSelectElement>;

export type Option<T> = {
  readonly key?: string | number;
  readonly value: T;
  readonly name: string;
  readonly disabled?: boolean;
};

interface SelectComponent {
  <T>(props: Props<T>): JSX.Element;

  displayName: string;
}

export const Select = React.forwardRef(function<T>(
  props: Props<T>,
  ref: Ref<HTMLSelectElement>
) {
  const {
    value,
    options,
    className,
    disabled = false,
    minimal = false,
    onChange,
    ...otherProps
  } = props;

  const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = options[e.target.selectedIndex].value;
    onChange(newValue, e);
  }, [options, onChange]);

  const [children, htmlValue] = renderOptions(options, value);

  return (
    <S.Wrapper className={className}>
      <S.Select
        {...otherProps}
        value={htmlValue}
        $minimal={minimal}
        disabled={disabled}
        onChange={handleChange}
        ref={ref}
      >
        {children}
      </S.Select>
      <S.Arrow>
        <path d='M0,1 H8 L4,7 Z' fill='currentColor'/>
      </S.Arrow>
    </S.Wrapper>
  );
}) as SelectComponent;

Select.displayName = 'Select';

function renderOptions<T>(
  options: readonly Option<T>[],
  value: T
): [ReactNode, string | undefined] {
  let selectValue: string | undefined;

  const children = options.map((opt, i) => {
    const optionValue = String(i);
    if (opt.value === value) {
      selectValue = optionValue;
    }

    return (
      <option
        key={String(opt.key ?? opt.value)}
        value={optionValue}
        disabled={opt.disabled}
      >
        {opt.name}
      </option>
    );
  });

  return [children, selectValue];
}
