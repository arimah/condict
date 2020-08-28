import {ReactNode} from 'react';

import {LinkTarget} from '../../types';

export type SearchResult = {
  readonly target: LinkTarget;
  readonly name: ReactNode;
  readonly snippet?: ReactNode;
};
