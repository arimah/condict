/* eslint-disable react/jsx-key */
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {ifProp, theme} from 'styled-tools';
import memoizeOne from 'memoize-one';

import {
  CommandGroup,
  Button,
  Checkbox,
  LightTheme,
} from '../../../src';

const Group = styled.div`
  padding: 16px;
  border: 2px solid ${theme('general.borderColor')};
  border-radius: 3px;

  &:focus {
    ${theme('focus.style')}
    border-color: ${theme('focus.color')};
  }
`;

const ResultDisplay = styled.div`
  font-style: ${ifProp('italic', 'italic')};
  font-weight: ${ifProp('bold', 'bold')};

  :not(:first-child) {
    margin-top: 8px;
  }

  :not(:last-child) {
    margin-bottom: 8px;
  }
`;

Group.defaultProps = {
  theme: LightTheme,
};

class CommandDemo extends PureComponent {
  constructor() {
    super();

    this.getOuterCommands = memoizeOne(this.getOuterCommands.bind(this));
    this.getInnerCommands = memoizeOne(this.getInnerCommands.bind(this));
    this.execCommand = cmd => this.props.toggleState(cmd.exec());
  }

  getOuterCommands() {
    return {
      toggleItalic: {
        shortcut: 'Primary+I i',
        exec: () => 'italicOuter',
      },
      toggleBold: {
        shortcut: 'Primary+B b',
        exec: () => 'bold',
      },
    };
  }

  getInnerCommands() {
    return {
      toggleItalic: {
        shortcut: 'Primary+I i',
        exec: () => 'italicInner',
      },
    };
  }

  render() {
    const {
      outerDisabled,
      innerDisabled,
      italicOuter,
      italicInner,
      bold,
    } = this.props.state;

    return (
      <CommandGroup
        as={Group}
        tabIndex={0}
        disabled={outerDisabled}
        commands={this.getOuterCommands()}
        onExec={this.execCommand}
      >
        <div>
          <Button
            slim
            label='Toggle italic'
            command='toggleItalic'
          />
          {' '}
          <Button
            slim
            label='Toggle bold'
            command='toggleBold'
          />
        </div>
        <ResultDisplay
          italic={italicOuter}
          bold={bold}
        >
          outer state: italic={String(italicOuter)}, bold={String(bold)}
        </ResultDisplay>
        <CommandGroup
          as={Group}
          tabIndex={0}
          disabled={innerDisabled}
          commands={this.getInnerCommands()}
          onExec={this.execCommand}
        >
          <div>
            <Button
              slim
              label='Toggle italic (inner)'
              command='toggleItalic'
            />
            {' '}
            <Button
              slim
              label='Toggle bold (outer)'
              command='toggleBold'
            />
          </div>
          <ResultDisplay italic={italicInner}>
            inner state: italic={String(italicInner)}
          </ResultDisplay>
        </CommandGroup>
      </CommandGroup>
    );
  }
}

CommandDemo.propTypes = {
  state: PropTypes.shape({
    outerDisabled: PropTypes.bool.isRequired,
    innerDisabled: PropTypes.bool.isRequired,
    italicOuter: PropTypes.bool.isRequired,
    italicInner: PropTypes.bool.isRequired,
    bold: PropTypes.bool.isRequired,
  }).isRequired,
  toggleState: PropTypes.func.isRequired,
};

export default Object.freeze({
  name: 'Command',
  initialState: {
    outerDisabled: false,
    innerDisabled: false,
    italicOuter: false,
    italicInner: false,
    bold: false,
  },
  controls: (state, _setState, toggleState) => [
    <Checkbox
      checked={state.outerDisabled}
      label='Outer disabled'
      onChange={() => toggleState('outerDisabled')}
    />,
    <Checkbox
      checked={state.innerDisabled}
      label='Inner disabled'
      onChange={() => toggleState('innerDisabled')}
    />,
  ],
  // eslint-disable-next-line react/display-name
  contents: (state, setState, toggleState) =>
    <CommandDemo
      state={state}
      setState={setState}
      toggleState={toggleState}
    />,
});
