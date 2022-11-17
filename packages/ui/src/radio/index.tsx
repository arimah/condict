import React, {
  InputHTMLAttributes,
  Ref,
  ReactNode,
  useContext,
  useMemo,
} from 'react';

import MarkerLocation from '../marker-location';
import genUniqueId from '../unique-id';

import * as S from './styles';

export type Props = {
  marker?: MarkerLocation;
  inputRef?: Ref<HTMLInputElement>;
  children?: ReactNode;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
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
    disabled,
    name = '',
    marker = 'before',
    inputRef,
    children,
    // checked deliberately included here
    ...inputProps
  } = props;

  const radioGroup = useContext(RadioGroupContext);
  const actualName = `${radioGroup.namePrefix}${name}`;

  return (
    <S.Label className={className} $marker={marker} $disabled={disabled}>
      <S.Input
        {...inputProps}
        name={actualName}
        disabled={disabled}
        ref={inputRef}
      />
      <S.RadioContainer>
        <S.RadioDot/>
      </S.RadioContainer>
      <S.Content>{children}</S.Content>
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
