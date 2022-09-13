import React from 'react';

import {Page} from '../page';

import HomePage from './home';
import LanguagePage from './language';
import LemmaPage from './lemma';
import DefinitionPage from './definition';
import PartOfSpeechPage from './part-of-speech';
import InflectionTablePage from './inflection-table';
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
    case 'lemma':
      return (
        <LemmaPage
          {...commonProps}
          id={page.id}
          languageId={page.language.id}
        />
      );
    case 'definition':
      return (
        <DefinitionPage
          {...commonProps}
          id={page.id}
          languageId={page.language.id}
        />
      );
    case 'partOfSpeech':
      return (
        <PartOfSpeechPage
          {...commonProps}
          id={page.id}
          languageId={page.language.id}
        />
      );
    case 'inflectionTable':
      return (
        <InflectionTablePage
          {...commonProps}
          id={page.id}
          languageId={page.language.id}
        />
      );
    default:
      return <UnimplementedPage/>;
  }
});

PageContent.displayName = 'PageContent';

export default PageContent;
