import styled, {css} from 'styled-components';

import Link from '../link';

// The slightly weird margins and paddings here are to make sure a link title
// has a fully visible focus rectangle, as the <div> with the content has
// overflow: hidden.

const BaseStyles = css`
  display: flex;
  flex-direction: row;
  padding: 6px;
  border: 2px solid var(--bg);
  border-radius: 7px;
  background-color: var(--bg);
  box-shadow: var(--shadow-elevation-1);

  > .mdi-icon {
    flex: none;
    align-self: center;
    margin-block: -8px;
    padding-inline: 8px;
    color: var(--fg);
  }

  > div {
    flex: 1 1 auto;
    padding: 8px;
    /* Allows the title text to overflow with "...". Content that wraps will
     * still wrap correctly.
     */
    overflow: hidden;
  }
`;

export const Card = styled.div.attrs({
  role: 'group',
})`
  ${BaseStyles}
`;

export const LinkCard = styled(Link)`
  ${BaseStyles}
  transition: box-shadow ${p => 1.25 * p.theme.timing.short}ms ease-in-out;

  &:is(:focus, :focus-visible) {
    border-color: var(--focus-border);
    border-style: var(--focus-border-style);
    border-radius: 7px;
    box-shadow: var(--shadow-elevation-1), var(--focus-shadow);
  }

  &:hover {
    box-shadow: var(--shadow-elevation-3);
  }

  &:hover:focus {
    box-shadow: var(--shadow-elevation-3), var(--focus-shadow);
  }
`;

// The weird margins and paddings inside the title are to enable focus
// rectangles for embedded links. Without a bit of extra padding, the
// link's focus rectangle gets cut off by overflow: hidden.

export const Title = styled.div`
  margin: -6px;
  padding: 6px;
  overflow: hidden;

  font-weight: normal;
  font-size: 18px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;

  > :is(h2, h3, h4) {
    display: inline;
    font: inherit;
  }

  .mdi-icon {
    margin-block: -1px;
    vertical-align: -5px;

    :not(:first-child) {
      margin-inline-start: 8px;
    }

    :not(:last-child) {
      margin-inline-end: 8px;
    }
  }
`;

export const Content = styled.div`
  margin-top: 8px;
  color: var(--fg);

  > :first-child {
    margin-top: 0;
  }

  > :last-child {
    margin-bottom: 0;
  }
`;
