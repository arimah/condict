import React, {Component, ChangeEvent} from 'react';
import ReactDOM from 'react-dom';
import {ThemeProvider} from 'styled-components';

import {
  Button,
  Switch,
  Intent,
  DarkTheme,
  LightTheme,
  GlobalStyles as ComponentStyles,
} from '../src';
import Demo from './demo';
import ComponentDemos from './components';

import * as S from './styles';

type Settings = {
  [key: string]: any;
};

const InitialSettings: Settings = {
  darkTheme: false,
};

const SettingsKey = 'uiComponentsSettings';

const importSettings = (settings: Settings) => ComponentDemos.reduce(
  (settings, demo) => {
    const demoState = {
      ...demo.initialState,
      ...settings[demo.name] as any,
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

const readSettings = (): Settings => {
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

const exportSettings = (settings: Settings) => ComponentDemos.reduce(
  (settings, demo) =>
    demo.exportState
      ? {
        ...settings,
        [demo.name]: demo.exportState(settings[demo.name] || demo.initialState),
      }
      : settings,
  settings
);

const writeSettings = (settings: Settings) => {
  try {
    settings = exportSettings(settings);
    const settingsJson = JSON.stringify(settings);
    localStorage[SettingsKey] = settingsJson;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to write settings:', e);
  }
};

type State = {
  settings: Settings;
};

class App extends Component<{}, State> {
  public state: State = {
    settings: readSettings(),
  };

  private saveSettings = () => {
    writeSettings(this.state.settings);
  };

  private changeSetting = (key: string, value: any) => {
    const {settings} = this.state;
    const newSettings = {
      ...settings,
      [key]: value,
    };
    this.setState({settings: newSettings}, this.saveSettings);
  };

  private handleToggleDarkTheme = (e: ChangeEvent<HTMLInputElement>) => {
    this.changeSetting('darkTheme', e.target.checked);
  };

  private handleResetAll = () => {
    const {darkTheme} = this.state.settings;
    this.setState({
      settings: {
        ...importSettings(InitialSettings),
        darkTheme,
      },
    }, this.saveSettings);
  };

  private handleSetDemoState = (demoName: string, partialState: any) => {
    const state = this.state.settings[demoName];
    this.changeSetting(demoName, {
      ...state,
      ...partialState,
    });
  };

  private handleToggleDemoState = (demoName: string, key: string) => {
    const state = this.state.settings[demoName];
    const newState = {
      ...state,
      [key]: !state[key],
    };
    this.changeSetting(demoName, newState);
  };

  public render() {
    const {settings} = this.state;

    return (
      <ThemeProvider theme={settings.darkTheme ? DarkTheme : LightTheme}>
        <>
          <h1>UI component test page</h1>

          <S.Group>
            <Switch
              intent={Intent.SECONDARY}
              checked={settings.darkTheme}
              label='Dark theme'
              onChange={this.handleToggleDarkTheme}
            />
            <Button
              slim
              intent={Intent.DANGER}
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
