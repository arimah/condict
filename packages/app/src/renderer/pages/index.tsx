import React from 'react';

import {Page} from '../page';

import HomePage from './home';
import LanguagePage from './language';
import PartOfSpeechPage from './part-of-speech';
import UnimplementedPage from './unimplemented';
import {PageProps} from './types';

export type Props = {
  page: Page;
} & PageProps;

const PageContent = React.memo(({page, ...commonProps}: Props): JSX.Element => {
  switch (page.type) {
    case 'home':
      return <HomePage {...commonProps}/>;
    case 'language':
      return <LanguagePage {...commonProps} id={page.id}/>;
    case 'partOfSpeech':
      return <PartOfSpeechPage {...commonProps} id={page.id}/>;
    default:
      return <UnimplementedPage/>;
  }
});

PageContent.displayName = 'PageContent';

export default PageContent;
