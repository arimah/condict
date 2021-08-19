import styled from 'styled-components';

import {BodyText} from '@condict/ui';

export type MainProps = {
  expanded: boolean;
};

export const Main = styled(BodyText)<MainProps>`
  /* -webkit-line-clamp is only supported with the old, weird -webkit-box. */
  ${p => !p.expanded && `
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}

  /* Margins cannot "bleed" outside a -webkit-box, so delete them altogether. */
  > :first-child,
  > ol:first-child > li:first-child,
  > ul:first-child > li:first-child {
    margin-top: 0;
  }

  > :last-child,
  > ol:last-child > li:last-child,
  > ul:last-child > li:last-child {
    margin-bottom: 0;
  }
`;
