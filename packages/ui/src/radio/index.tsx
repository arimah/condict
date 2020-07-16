import React, {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  Ref,
  ReactNode,
  useContext,
  useMemo,
} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';

import Intent from '../intent';
import genUniqueId from '../unique-id';

import * as S from './styles';

export type Props = {
  label?: string;
  labelProps?: Omit<
    LabelHTMLAttributes<HTMLLabelElement>,
    'className'
  >;
  inputRef?: Ref<HTMLInputElement>;
  children?: ReactNode;
} & Partial<S.IntentProps> & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-label' | 'type'
>;

export type GroupProps = {
  name?: string | null;
  children: ReactNode;
};

type ContextValue = {
  namePrefix: string;
};

export const RadioGroupContext = React.createContext<ContextValue>({
  namePrefix: '',
});

export const Radio = (props: Props): JSX.Element => {
  const {
    className,
    intent = Intent.PRIMARY,
    label,
    disabled,
    name = '',
    labelProps,
    inputRef,
    children,
    // checked deliberately included here
    ...inputProps
  } = props;
  const radioGroup = useContext(RadioGroupContext);

  const actualName = `${radioGroup.namePrefix}${name}`;

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  return (
    <S.Label
      {...labelProps}
      intent={intent}
      className={className}
      disabled={disabled}
    >
      <S.Input
        {...inputProps}
        intent={intent}
        name={actualName}
        disabled={disabled}
        aria-label={ariaLabel}
        ref={inputRef}
      />
      <S.RadioContainer>
        <S.RadioDot intent={intent}/>
      </S.RadioContainer>
      {renderedContent}
    </S.Label>
  );
};

const getContextValue = (name: string | undefined | null): ContextValue => ({
  namePrefix: name != null ? name : `${genUniqueId()}-`,
});

const RadioGroup = ({name, children}: GroupProps) => {
  const value = useMemo(() => getContextValue(name), [name]);
  return (
    <RadioGroupContext.Provider value={value}>
      {children}
    </RadioGroupContext.Provider>
  );
};

Radio.Group = RadioGroup;
