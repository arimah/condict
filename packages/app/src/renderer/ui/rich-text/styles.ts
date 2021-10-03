import styled from 'styled-components';

import {BodyText} from '@condict/ui';

export type ContainerProps = {
  clamped: boolean;
  selectable: boolean;
};

export const Container = styled(BodyText)<ContainerProps>`
  margin-block: 8px;
  white-space: pre-wrap;
  ${p => p.clamped && `
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
  user-select: ${p => p.selectable && 'text'};

  /* Margins cannot "bleed" outside a -webkit-box, so (consistently) delete them
   * from all first & last blocks. Not ideal, but better than barely-controllable
   * spurious extra margins.
   */

  .first-block.first-block {
    margin-top: 0;
  }

  .last-block.last-block {
    margin-bottom: 0;
  }
`;
