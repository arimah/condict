import {AppTheme} from './types';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends AppTheme {
  }
}
