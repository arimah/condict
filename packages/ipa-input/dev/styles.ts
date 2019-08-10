import {createGlobalStyle} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

import {transition} from '@condict/ui';

export const AppStyles = createGlobalStyle`
  body {
    background-color: ${ifProp(theme('dark'),
      theme('general.hoverBg'),
      theme('general.activeBg')
    )};
    color: ${theme('general.fg')};

    ${transition('color, background-color')}
  }

  #app-root {
    margin-left: auto;
    margin-right: auto;
    max-width: 900px;
  }
`;
