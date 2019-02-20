import React, {Component, useContext, useMemo} from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';

import {Shortcut, ShortcutGroup, ShortcutMap} from './shortcut';

const Context = React.createContext(null);

const commandEquals = (a, b) =>
  a.disabled === b.disabled &&
  a.exec === b.exec &&
  Shortcut.is(a.shortcut, b.shortcut);

const buildCommandMap = (commands, groupDisabled) =>
  Object.keys(commands).reduce((result, name) => {
    const cmd = commands[name];
    const {shortcut} = cmd;
    result.set(name, {
      disabled: !!(groupDisabled || cmd.disabled),
      exec: cmd.exec,
      shortcut:
        typeof shortcut === 'string' ? Shortcut.parse(shortcut) :
        Array.isArray(shortcut) ? ShortcutGroup.parse(shortcut) :
        (shortcut instanceof Shortcut || shortcut instanceof ShortcutGroup) ? shortcut :
        null,
    });
    return result;
  }, new Map());

const getContextValue = (commandMap, onExec, parent) => ({
  commandMap,
  onExec,
  parent,
});

export class CommandGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastDisabled: props.disabled,
    };

    this.getContextValue = memoizeOne(getContextValue);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleKeyDown(e) {
    if (!this.props.disabled) {
      const cmd = this.state.keyMap.get(e);
      if (cmd && !cmd.disabled) {
        e.preventDefault();
        e.stopPropagation();
        this.props.onExec(cmd);
        return;
      }
    }
    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);
    }
  }

  render() {
    const {
      as: Inner,
      disabled,
      commands: _commands,
      onExec,
      onKeyDown: _onKeyDown,
      children,
      // className deliberately included here
      ...otherProps
    } = this.props;
    const {commandMap} = this.state;
    const contextValue = this.getContextValue(commandMap, onExec, this.context);

    // disabled is passed to the inner component, since it's a
    // standard HTML attribute.
    return (
      <Context.Provider value={contextValue}>
        <Inner
          {...otherProps}
          disabled={disabled}
          onKeyDown={this.handleKeyDown}
        >
          {children}
        </Inner>
      </Context.Provider>
    );
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.commands === state.lastCommands &&
      props.disabled === state.lastDisabled
    ) {
      return null;
    }

    const {commandMap: lastCommandMap} = state;
    const commandMap = buildCommandMap(props.commands, props.disabled);
    // Commands that haven't changed get replaced by whatever was in the
    // previous command map. This ensures we don't update any more command
    // consumers than we have to.
    commandMap.forEach((cmd, name) => {
      const prevCmd = lastCommandMap && lastCommandMap.get(name);
      if (prevCmd && commandEquals(prevCmd, cmd)) {
        commandMap.set(name, prevCmd);
      }
    });
    return {
      lastCommands: props.commands,
      lastDisabled: props.disabled,
      commandMap,
      // It doesn't matter much if we rebuild the key map even when nothing
      // has changed. We only use it internally.
      keyMap: new ShortcutMap(commandMap, cmd => cmd.shortcut),
    };
  }
}

CommandGroup.contextType = Context;

CommandGroup.propTypes = {
  as: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  commands: PropTypes.object.isRequired,
  onExec: PropTypes.func,
  onKeyDown: PropTypes.func,
  children: PropTypes.node,
};

CommandGroup.defaultProps = {
  as: 'div',
  className: '',
  disabled: false,
  onExec: cmd => cmd.exec(),
  onKeyDown: null,
  children: null,
};

const getCommand = (name, context) => {
  let group = context;
  while (group !== null) {
    const cmd = group.commandMap.get(name);
    if (cmd) {
      return Object.freeze({
        ...cmd,
        exec: () => { group.onExec(cmd); },
      });
    }
    group = group.parent;
  }
  return null;
};

const renderChildren = (children, command) => children(command);

export class CommandConsumer extends Component {
  constructor() {
    super();

    this.getCommand = memoizeOne(getCommand);
    this.renderChildren = memoizeOne(renderChildren);
  }

  render() {
    const {name, children} = this.props;
    const command = this.getCommand(name, this.context);
    return this.renderChildren(children, command);
  }
}

CommandConsumer.contextType = Context;

CommandConsumer.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
};

export const useCommand = name => {
  const context = useContext(Context);
  const command = useMemo(
    () => name != null ? getCommand(name, context) : null,
    [name, context]
  );
  return command;
};
