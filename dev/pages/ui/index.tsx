import React from 'react';
import Head from 'next/head';

import {Container, Nav, Main} from '../../components/sidebar';
import {ComponentNav} from '../../components/ui';

const Page = (): JSX.Element => {
  return <>
    <Head>
      <title>UI &ndash; Condict UI components</title>
    </Head>

    <Container>
      <Nav>
        <ComponentNav/>
      </Nav>
      <Main>
        <section>
          <p>&larr; Select a component to try it out!</p>
        </section>
      </Main>
    </Container>
  </>;
};

export default Page;
