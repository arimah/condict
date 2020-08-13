import {ReactNode} from 'react';

import {LinkTarget} from '../../types';

export type SearchResult = {
  readonly target: LinkTarget;
  readonly name: ReactNode;
  readonly snippet?: ReactNode;
};

export type PlacementRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly parentWidth: number;
};
