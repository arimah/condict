import React from 'react';
import Head from 'next/head';

import TableEditorDemo from '../components/table-editor';

const Main = (): JSX.Element => {
  return <>
    <Head>
      <title>Table editor &ndash; Condict UI components</title>
    </Head>
    <TableEditorDemo/>
  </>;
};

export default Main;
