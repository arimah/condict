import React, {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  Ref,
  ReactNode,
  useContext,
  useMemo,
} from 'react';

import {getContentAndLabel} from '../a11y-utils';
import MarkerLocation from '../marker-location';
import genUniqueId from '../unique-id';

import * as S from './styles';

export type Props = {
  label?: string;
  labelProps?: Omit<
    LabelHTMLAttributes<HTMLLabelElement>,
    'className'
  >;
  marker?: MarkerLocation;
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
    intent = 'accent',
    label,
    disabled,
    name = '',
    labelProps,
    marker = 'before',
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
      marker={marker}
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
      <S.Content>{renderedContent}</S.Content>
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

Radio.Content = S.Content;
