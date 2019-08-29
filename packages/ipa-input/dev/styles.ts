import {createGlobalStyle} from 'styled-components';

import {transition} from '@condict/ui';

export const AppStyles = createGlobalStyle`
  body {
    background-color: ${p => p.theme.general[
      p.theme.dark ? 'hoverBg' : 'activeBg'
    ]};
    color: ${p => p.theme.general.fg};

    ${transition('color, background-color')}
  }

  #app-root {
    margin-left: auto;
    margin-right: auto;
    max-width: 900px;
  }
`;
