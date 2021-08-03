import {RefObject} from 'react';

export interface PageProps {
  /** The outer element that contains the page, for focus management. */
  pageRef: RefObject<HTMLElement>;
}
