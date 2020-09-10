import React from 'react';
import Head from 'next/head';

import RichTextEditorDemo from '../components/rich-text-editor';

const Main = (): JSX.Element => {
  return <>
    <Head>
      <title>Rich text editor &ndash; Condict UI components</title>
    </Head>
    <RichTextEditorDemo/>
  </>;
};

export default Main;
