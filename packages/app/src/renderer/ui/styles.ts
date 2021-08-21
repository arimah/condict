import styled from 'styled-components';

import {Button} from '@condict/ui';

// Dimensions

export const SidebarIdealWidth = '25vw';

export const SidebarMinWidth = '264px';

export const SidebarMaxWidth = '336px';

/**
 * CSS expression, minus the `calc()`, that evaluates to the width of the main
 * content area.
 */
export const MainContentWidth =
  `100vw - clamp(${SidebarMinWidth}, ${SidebarIdealWidth}, ${SidebarMaxWidth})`;

// General-purpose simple styled components.

export const MainHeader = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 12px;
  gap: 16px;

  && > h1 {
    flex: 1 1 auto;
    margin-block: 0;
  }
`;

export const HeaderAction = styled(Button)`
  flex: none;
  align-self: flex-start;
  min-width: 96px;
`;

export const Subheader = styled.p`
  display: flex;
  flex-direction: row;
  margin-block: -8px 12px;
  gap: 16px;
`;

export const ResourceMeta = styled.span`
  flex: 1 1 auto;
  text-align: end;
  opacity: 0.7;
`;

export const FlowContent = styled.div`
  max-width: 800px;
`;

// NB: The 96px value MUST be synchronised with the left gutter and the various
// left/right paddings in the tab panel area!
// 64px gutter + 32px inline-end padding = 96px
export const FullWidth = styled.div`
  width: calc(${MainContentWidth} - 96px);
`;

export const Selectable = styled.div`
  user-select: text;
`;

export const CardList = styled.div`
  margin-block: 8px 16px;

  > :not(:last-child) {
    margin-bottom: 8px;
  }
`;

export const CardGrid = styled.div`
  display: grid;
  margin-block: 8px 16px;
  align-items: start;
  gap: 8px;
`;

/**
 * A small bit of extra context, such as a part of speech name or parent
 * language, that is placed in a card title.
 */
export const CardTitleContext = styled.span`
  margin-inline-start: 16px;
  font-size: 15px;
  line-height: 16px;
`;

export const FullRow = styled.div`
  grid-column: 1 / -1;
`;

export const TagList = styled.ul`
  display: flex;
  padding: 0;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  list-style-type: none;

  > li {
    margin: 0;
  }
`;

export const Secondary = styled.span`
  opacity: 0.7;
`;

export const NakedButton = styled(Button)`
  border-color: ${p => p.theme.defaultBg};
  background-color: ${p => p.theme.defaultBg};
  color: ${p => p.theme.defaultFg};

  &:hover {
    border-color: ${p => p.theme.defaultHoverBg};
    background-color: ${p => p.theme.defaultHoverBg};
  }

  &:active {
    border-color: ${p => p.theme.defaultActiveBg};
    background-color: ${p => p.theme.defaultActiveBg};
  }

  &:focus,
  &.force-focus {
    border-color: ${p => p.theme.focus.color};
  }
`;
