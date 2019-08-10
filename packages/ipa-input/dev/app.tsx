import React, {ChangeEvent, Component} from 'react';
import ReactDOM from 'react-dom';
import {ThemeProvider} from 'styled-components';

import {
  Switch,
  DarkTheme,
  LightTheme,
  GlobalStyles as ComponentStyles,
  Intent,
} from '@condict/ui';

import {IpaInput} from '../src';

import * as S from './styles';

interface State {
  darkTheme: boolean;
}

class App extends Component<{}, State> {
  public state: State = {
    darkTheme: false,
  };

  private handleToggleDarkTheme = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({darkTheme: e.target.checked});
  };

  public render() {
    const {state} = this;
    return (
      <ThemeProvider theme={state.darkTheme ? DarkTheme : LightTheme}>
        <>
          <h1>IPA input test page</h1>
          <p>
            <Switch
              intent={Intent.SECONDARY}
              checked={state.darkTheme}
              label='Dark theme'
              onChange={this.handleToggleDarkTheme}
            />
          </p>

          <IpaInput/>

          <S.AppStyles/>
          <ComponentStyles/>
        </>
      </ThemeProvider>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('app-root'));
