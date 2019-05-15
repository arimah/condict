import React from 'react';
import ReactDOM from 'react-dom';
import styled, {createGlobalStyle} from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    font-family: 'inter', sans-serif;
    font-size: 12pt;
  }
`;

const App = () =>
  <>
    <h1>Condict dev server</h1>
    <p>Congratulations! If you see this, it means Condict web server is running correctly.</p>
    <p>Try editing <code>dev/app.js</code> to see hot reloading in action.</p>
    <p>This file is served from static content: <img src="/heart.png"/></p>
    <GlobalStyles/>
  </>;

ReactDOM.render(<App/>, document.getElementById('app-root'));
