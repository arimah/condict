import HomePage from './home';
import LanguagePage from './language';
import PartOfSpeechPage from './part-of-speech';
import UnimplementedPage from './unimplemented';
import {Page} from './types';

export type Props = {
  page: Page;
};

const PageContent = ({page}: Props): JSX.Element => {
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
};

export default PageContent;
