import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {ThemeProvider} from 'styled-components';

import {
  Button,
  Switch,
  DarkTheme,
  LightTheme,
  GlobalStyles as ComponentStyles,
} from '../src';
import Demo from './demo';
import ComponentDemos from './components';

import * as S from './styles';

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
      ...partialState,
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
          <h1>UI component test page</h1>

          <S.Group>
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
          </S.Group>

          {ComponentDemos.map(demo =>
            <Demo
              key={demo.name}
              name={demo.name}
              state={settings[demo.name]}
              controls={demo.controls}
              contents={demo.contents}
              alignX={demo.alignX}
              alignY={demo.alignY}
              onSetState={this.handleSetDemoState}
              onToggleState={this.handleToggleDemoState}
            />
          )}

          <S.AppStyles/>
          <ComponentStyles/>
        </>
      </ThemeProvider>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('app-root'));
