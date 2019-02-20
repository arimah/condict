import React, {PureComponent, useContext} from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';

import {getContentAndLabel} from '@condict/a11y-utils';
import genId from '@condict/gen-id';

import * as S from './styles';

export const RadioGroupContext = React.createContext({namePrefix: ''});

export const Radio = props => {
  const {
    className,
    intent,
    checked,
    label,
    disabled,
    name,
    value,
    labelProps,
    inputRef,
    onChange,
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
          value={value}
          disabled={disabled}
          checked={checked}
          aria-label={ariaLabel}
          onChange={onChange}
          ref={inputRef}
        />
      </S.RadioContainer>
      {renderedContent}
    </S.Label>
  );
};

Radio.propTypes = {
  className: PropTypes.string,
  intent: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  labelProps: PropTypes.object,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({current: PropTypes.any}),
  ]),
  onChange: PropTypes.func,
  children: PropTypes.node,
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

const getContextValue = name => ({
  namePrefix: name !== null ? name : `${genId()}-`,
});

Radio.Group = class RadioGroup extends PureComponent {
  constructor() {
    super();

    this.getContextValue = memoizeOne(getContextValue);
  }

  render() {
    const {name, children} = this.props;
    const value = this.getContextValue(name);

    return (
      <RadioGroupContext.Provider value={value}>
        {children}
      </RadioGroupContext.Provider>
    );
  }
};

Radio.Group.propTypes = {
  name: PropTypes.string,
  children: PropTypes.node,
};

Radio.Group.defaultProps = {
  name: null,
};
