import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import styled, {createGlobalStyle, ThemeProvider} from 'styled-components';
import {theme} from 'styled-tools';

import {
  Button,
  Switch,
  DarkTheme,
  LightTheme,
  GlobalStyles as ComponentStyles,
  Command,
  CommandGroup,
  Shortcut,
} from '../../src';
import Demo from './demo';
import ComponentDemos from './components';

// FIXME: remove this crap
window.Command = Command;
window.CommandGroup = CommandGroup;
window.Shortcut = Shortcut;

const AppStyles = createGlobalStyle`
  body {
    font-size: 11pt;
    font-family: 'Inter UI', sans-serif;
    background-color: ${theme('general.activeBg')};
    color: ${theme('general.fg')};

    transition-property: color, background-color;
    transition-timing-function: linear;
    transition-duration: ${theme('timing.short')};
  }

  #app-root {
    margin-left: auto;
    margin-right: auto;
    max-width: 900px;
  }

  h1 {
    margin-top: 10px;
    margin-bottom: 20px;
    font-size: 2rem;
  }

  h2 {
    margin-top: 40px;
    margin-bottom: 15px;
    font-size: 1.5rem;
  }

  h3 {
    margin-top: 30px;
    margin-bottom: 10px;
    font-size: 1.25rem;
  }

  p {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`;

const Group = styled.p`
  & > :not(:last-child) {
    margin-right: 16px;
  }
`;

const InitialSettings = {
  darkTheme: false,
};

const SettingsKey = 'uiComponentsSettings';

const importSettings = settings => ComponentDemos.reduce(
  (settings, demo) => {
    const demoState = {
      ...demo.initialState,
      ...settings[demo.name],
    };
    return {
      ...settings,
      [demo.name]: demo.importState
        ? demo.importState(demoState)
        : demoState,
    };
  },
  {
    ...InitialSettings,
    ...settings,
  }
);

const readSettings = () => {
  let settings = InitialSettings;
  try {
    const settingsJson = localStorage[SettingsKey];
    if (settingsJson) {
      settings = JSON.parse(settingsJson);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to read settings:', e);
  }
  return importSettings(settings);
};

const exportSettings = settings => ComponentDemos.reduce(
  (settings, demo) =>
    demo.exportState
      ? {
        ...settings,
        [demo.name]: demo.exportState(settings[demo.name] || demo.initialState),
      }
      : settings,
  settings
);

const writeSettings = settings => {
  try {
    settings = exportSettings(settings);
    const settingsJson = JSON.stringify(settings);
    localStorage[SettingsKey] = settingsJson;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to write settings:', e);
  }
};

class App extends Component {
  constructor() {
    super();

    this.state = {
      settings: readSettings(),
    };

    this.saveSettings = this.saveSettings.bind(this);
    this.changeSetting = this.changeSetting.bind(this);
    this.handleToggleDarkTheme = this.handleToggleDarkTheme.bind(this);
    this.handleResetAll = this.handleResetAll.bind(this);
    this.handleSetDemoState = this.handleSetDemoState.bind(this);
    this.handleToggleDemoState = this.handleToggleDemoState.bind(this);
  }

  saveSettings() {
    writeSettings(this.state.settings);
  }

  changeSetting(key, value) {
    const {settings} = this.state;
    const newSettings = {
      ...settings,
      [key]: value,
    };
    this.setState({settings: newSettings}, this.saveSettings);
  }

  handleToggleDarkTheme(e) {
    this.changeSetting('darkTheme', e.target.checked);
  }

  handleResetAll() {
    const {darkTheme} = this.state.settings;
    this.setState({
      settings: {
        ...importSettings(InitialSettings),
        darkTheme,
      },
    }, this.saveSettings);
  }

  handleSetDemoState(demoName, partialState) {
    const state = this.state.settings[demoName];
    this.changeSetting(demoName, {
      ...state,
      ...partialState
    });
  }

  handleToggleDemoState(demoName, key) {
    const state = this.state.settings[demoName];
    const newState = {
      ...state,
      [key]: !state[key],
    };
    this.changeSetting(demoName, newState);
  }

  render() {
    const {settings} = this.state;

    return (
      <ThemeProvider theme={settings.darkTheme ? DarkTheme : LightTheme}>
        <>
          <h1>Admin UI component test page</h1>

          <Group>
            <Switch
              intent='secondary'
              checked={settings.darkTheme}
              label='Dark theme'
              onChange={this.handleToggleDarkTheme}
            />
            <Button
              intent='secondary'
              slim
              label='Reset all components'
              onClick={this.handleResetAll}
            />
          </Group>

          {ComponentDemos.map(demo =>
            <Demo
              key={demo.name}
              name={demo.name}
              state={settings[demo.name]}
              controls={demo.controls}
              contents={demo.contents}
              onSetState={this.handleSetDemoState}
              onToggleState={this.handleToggleDemoState}
            />
          )}

          <AppStyles/>
          <ComponentStyles/>
        </>
      </ThemeProvider>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('app-root'));
