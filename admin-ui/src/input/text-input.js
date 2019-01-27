import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import autoSizeInput from 'autosize-input';

import * as S from './styles';

export class TextInput extends PureComponent {
  constructor() {
    super();

    this.input = null;
    this.captureInput = this.captureInput.bind(this);
  }

  componentDidMount() {
    if (this.props.autoSize) {
      this.clearAutoSize = autoSizeInput(this.input);
    }
  }

  componentDidUpdate(prevProps) {
    const nextProps = this.props;

    if (nextProps.autoSize !== prevProps.autoSize) {
      if (prevProps.autoSize) {
        this.clearAutoSize();
        this.input.style.width = '';
      }
      if (nextProps.autoSize) {
        this.clearAutoSize = autoSizeInput(this.input);
      }
    }
  }

  componentWillUnmount() {
    if (this.clearAutoSize) {
      this.clearAutoSize();
    }
  }

  captureInput(elem) {
    this.input = elem;

    const {inputRef} = this.props;
    if (inputRef) {
      if (typeof inputRef === 'function') {
        inputRef(elem);
      } else {
        inputRef.current = elem;
      }
    }
  }

  render() {
    const {
      className,
      type,
      value,
      placeholder,
      minLength,
      maxLength,
      minimal,
      autoSize,
      disabled,
      borderRadius,
      onChange,
      ...otherProps
    } = this.props;

    return (
      <S.Input
        {...otherProps}
        className={className}
        type={type}
        value={value}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        minimal={minimal}
        autoSize={autoSize}
        disabled={disabled}
        borderRadius={borderRadius}
        onChange={onChange}
        ref={this.captureInput}
      />
    );
  }
}

TextInput.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf([
    'email',
    'password',
    'search',
    'tel',
    'text',
    'url',
  ]),
  value: PropTypes.string,
  placeholder: PropTypes.string,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  minimal: PropTypes.bool,
  autoSize: PropTypes.bool,
  disabled: PropTypes.bool,
  borderRadius: PropTypes.string,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({current: PropTypes.any}),
  ]),
  onChange: PropTypes.func,
};

TextInput.defaultProps = {
  className: '',
  type: 'text',
  value: '',
  placeholder: undefined,
  minLength: undefined,
  maxLength: undefined,
  minimal: false,
  autoSize: false,
  disabled: false,
  borderRadius: undefined,
  inputRef: undefined,
  onChange: () => {},
};
