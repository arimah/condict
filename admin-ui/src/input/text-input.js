import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import autoSizeInput from 'autosize-input';

import * as S from './styles';

export class TextInput extends PureComponent {
  constructor() {
    super();

    this.inputRef = React.createRef();
  }

  get input() {
    return this.inputRef.current;
  }

  componentDidMount() {
    if (this.props.autoSize) {
      this.clearAutoSize = autoSizeInput(this.inputRef.current);
    }
  }

  componentDidUpdate(prevProps) {
    const nextProps = this.props;

    if (nextProps.autoSize !== prevProps.autoSize) {
      if (prevProps.autoSize) {
        this.clearAutoSize();
        this.inputRef.current.style.width = '';
      }
      if (nextProps.autoSize) {
        this.clearAutoSize = autoSizeInput(this.inputRef.current);
      }
    }
  }

  componentWillUnmount() {
    if (this.clearAutoSize) {
      this.clearAutoSize();
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
        ref={this.inputRef}
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
  onChange: () => {},
};
