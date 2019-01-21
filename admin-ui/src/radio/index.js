import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {getContentAndLabel} from '@condict/a11y-utils';
import genId from '@condict/gen-id';

import * as S from './styles';

export const RadioGroupContext = React.createContext(null);

// This component is a class exclusively for `this.context`. If that weren't
// necessary, we could turn this into a functional stateless component.

export class Radio extends PureComponent {
  render() {
    const {
      className,
      intent,
      checked,
      label,
      disabled,
      name,
      value,
      labelProps,
      children,
      onChange,
      ...inputProps
    } = this.props;

    const actualName = this.context
      ? `${this.context.namePrefix}-${name || ''}`
      : name || '';

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
          />
        </S.RadioContainer>
        {renderedContent}
      </S.Label>
    );
  }
}

Radio.contextType = RadioGroupContext;

Radio.propTypes = {
  className: PropTypes.string,
  intent: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  labelProps: PropTypes.object,
  inputProps: PropTypes.object,
  onChange: PropTypes.func,
  children: PropTypes.node,
};

Radio.defaultProps = {
  className: '',
  intent: 'primary',
  checked: false,
  disabled: false,
  label: '',
  name: undefined,
  value: undefined,
  labelProps: null,
  inputProps: null,
  onChange: () => { },
};

Radio.Group = class RadioGroup extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      namePrefix: genId(),
      label: props.label,
    };
  }

  render() {
    return (
      <RadioGroupContext.Provider value={this.state}>
        {this.props.children}
      </RadioGroupContext.Provider>
    );
  }

  static getDerivedStateFromProps(props, state) {
    if (props.label !== state.label) {
      return {label: props.label};
    }
    return null;
  }
};

Radio.Group.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
};

Radio.Group.defaultProps = {
  label: null,
};
