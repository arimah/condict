import React from 'react';

import Document, {DocumentContext, DocumentInitialProps} from 'next/document';
import {ServerStyleSheet} from 'styled-components';

export default class DevDocument extends Document {
  public static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const {renderPage} = ctx;

    try {
      ctx.renderPage = () => renderPage({
        enhanceApp: App => props => sheet.collectStyles(
          <App {...props}/>
        ),
      });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: <>
          {initialProps.styles}
          {sheet.getStyleElement()}
        </>,
      };
    } finally {
      sheet.seal();
    }
  }
}
