import React from 'react';
import Head from 'next/head';
import {useRouter} from 'next/router';

import {Container, Nav, Main} from '../../components/sidebar';
import Components, {ComponentNav} from '../../components/ui';

const Page = (): JSX.Element => {
  const {query} = useRouter();
  const {component} = query;

  const Demo = typeof component === 'string'
    ? Components[component].demo
    : null;

  return <>
    <Head>
      <title>Component &ndash; Condict UI components</title>
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
