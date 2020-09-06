import React from 'react';
import {AppProps} from 'next/app';

import Container from '../components/container';

const App = (props: AppProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {Component, pageProps} = props;

  return (
    <Container>
      <Component {...pageProps}/>
    </Container>
  );
};

export default App;
