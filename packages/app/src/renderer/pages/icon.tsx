import HomeIcon from 'mdi-react/BookshelfIcon';
// TODO: Find better icons for these, or create our own.
import LanguageIcon from 'mdi-react/BookOpenPageVariantOutlineIcon';
import PartOfSpeechIcon from 'mdi-react/SelectGroupIcon';

import {Page} from './types';

export type Props = {
  page: Page;
};

const PageIcon = ({page}: Props): JSX.Element => {
  switch (page.type) {
    case 'home':
      return <HomeIcon/>;
    case 'language':
      return <LanguageIcon/>;
    case 'partOfSpeech':
      return <PartOfSpeechIcon/>;
  }
};

export default PageIcon;
