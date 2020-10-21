import React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';

import {Container, Nav, Main} from '../../components/sidebar';
import Components, {ComponentNav} from '../../components/ui';

const Page = (): JSX.Element => {
  const {query} = useRouter();
  const {component} = query;

  const selectedComponent = typeof component === 'string'
    ? Components[component]
    : null;
  const Demo = selectedComponent && selectedComponent.demo;

  return <>
    <Head>
      <title>
        {selectedComponent?.name || 'Unknown component'}
        {' '}
        &ndash; Condict UI components
      </title>
    </Head>

    <Container>
      <Nav>
        <ComponentNav/>
      </Nav>
      <Main>
        {Demo && <Demo/>}
      </Main>
    </Container>
  </>;
};

export default Page;
