import React, {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  PureComponent,
  Ref,
  ReactNode,
  useContext,
  useMemo,
} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';
import genId from '@condict/gen-id';

import * as S from './styles';

export type Props = {
  label: string;
  labelProps: Omit<
    LabelHTMLAttributes<HTMLLabelElement>,
    'className'
  >;
  inputRef?: Ref<HTMLInputElement>;
  children: ReactNode;
} & S.IntentProps & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-label' | 'type'
>;

export interface GroupProps {
  name?: string | null;
  children: ReactNode;
}

interface ContextValue {
  namePrefix: string;
}

export const RadioGroupContext = React.createContext<ContextValue>({namePrefix: ''});

export const Radio = (props: Props) => {
  const {
    className,
    intent,
    checked,
    label,
    disabled,
    name,
    labelProps,
    inputRef,
    children,
    ...inputProps
  } = props;
  const radioGroup = useContext(RadioGroupContext);

  const actualName = `${radioGroup.namePrefix}${name}`;

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  return (
    <S.Label
      {...labelProps}
      className={className}
      disabled={disabled}
    >
      <S.RadioContainer
        intent={intent}
        checked={checked}
        disabled={disabled}
      >
        <S.RadioDot
          intent={intent}
          checked={checked}
          disabled={disabled}
        />
        <S.Input
          {...inputProps}
          name={actualName}
          disabled={disabled}
          checked={checked}
          aria-label={ariaLabel}
          ref={inputRef}
        />
      </S.RadioContainer>
      {renderedContent}
    </S.Label>
  );
};

Radio.defaultProps = {
  className: '',
  intent: 'primary',
  checked: false,
  disabled: false,
  label: '',
  name: '',
  value: undefined,
  labelProps: null,
  inputRef: undefined,
  onChange: () => { },
};

const getContextValue = (name: string | undefined | null): ContextValue => ({
  namePrefix: name != null ? name : `${genId()}-`,
});

const RadioGroup = ({name, children}: GroupProps) => {
  const value = useMemo(() => getContextValue(name), [name]);
  return (
    <RadioGroupContext.Provider value={value}>
      {children}
    </RadioGroupContext.Provider>
  );
};

RadioGroup.defaultProps = {
  name: null,
};

Radio.Group = RadioGroup;
