import React from 'react';
import PropTypes from 'prop-types';

import {getContentAndLabel} from '@condict/a11y-utils';

import {useCommand} from '../command';
import {useShimmer, Shimmer} from '../shimmer';

import * as S from './styles';

export const Button = React.forwardRef((props, ref) => {
  const {
    disabled,
    label,
    href,
    type,
    command: commandName,
    onClick,
    children,
    // className, minimal, intent and slim deliberately included here
    ...otherProps
  } = props;

  const command = useCommand(commandName);
  const shimmer = useShimmer();

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  const buttonProps = {
    ...otherProps,
    'aria-label': ariaLabel,
  };
  if (command !== null) {
    buttonProps.disabled = command.disabled;
    buttonProps.onClick = command.exec;
  } else {
    buttonProps.disabled = disabled;
    buttonProps.onClick = onClick;
  }

  if (href != null) {
    return (
      <S.Link
        role='button'
        {...buttonProps}
        onMouseEnter={shimmer.events.enter}
        onMouseLeave={shimmer.events.leave}
        onMouseMove={shimmer.events.move}
        href={href}
        ref={ref}
      >
        {!props.minimal && !buttonProps.disabled &&
          <S.ShimmerWrapper slim={props.slim}>
            <Shimmer state={shimmer.state}/>
          </S.ShimmerWrapper>
        }
        {renderedContent}
      </S.Link>
    );
  } else {
    return (
      <S.Button
        {...buttonProps}
        onMouseEnter={shimmer.events.enter}
        onMouseLeave={shimmer.events.leave}
        onMouseMove={shimmer.events.move}
        type={type}
        ref={ref}
      >
        {!props.minimal && !buttonProps.disabled &&
          <S.ShimmerWrapper slim={props.slim}>
            <Shimmer state={shimmer.state}/>
          </S.ShimmerWrapper>}
        {renderedContent}
      </S.Button>
    );
  }
});
Button.displayName = 'Button';

Button.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  minimal: PropTypes.bool,
  intent: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  slim: PropTypes.bool,
  label: PropTypes.string,
  href: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit']),
  command: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

Button.defaultProps = {
  className: '',
  disabled: false,
  minimal: false,
  intent: 'primary',
  slim: false,
  label: '',
  href: null,
  type: 'button',
  command: null,
  onClick: null,
};
