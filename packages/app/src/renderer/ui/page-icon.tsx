import HomeIcon from 'mdi-react/BookshelfIcon';
import SearchIcon from 'mdi-react/BookSearchOutlineIcon';

import {ResourceIcon} from './resource-icons';
import {Page} from '../page';

export type Props = {
  page: Page;
};

const PageIcon = ({page}: Props): JSX.Element => {
  switch (page.type) {
    case 'home':
      return <HomeIcon/>;
    case 'search':
      return <SearchIcon/>;
    default:
      return <ResourceIcon type={page.type}/>;
  }
};

export default PageIcon;
