import React from 'react';

import {Page} from '../page';

import HomePage from './home';
import LanguagePage from './language';
import PartOfSpeechPage from './part-of-speech';
import UnimplementedPage from './unimplemented';

export type Props = {
  page: Page;
};

const PageContent = React.memo(({page}: Props): JSX.Element => {
  switch (page.type) {
    case 'home':
      return <HomePage/>;
    case 'language':
      return <LanguagePage id={page.id}/>;
    case 'partOfSpeech':
      return <PartOfSpeechPage id={page.id}/>;
    default:
      return <UnimplementedPage/>;
  }
});

PageContent.displayName = 'PageContent';

export default PageContent;
