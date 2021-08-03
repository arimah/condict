import styled, {css} from 'styled-components';

import Link from '../link';

const BaseStyles = css`
  display: flex;
  flex-direction: row;
  padding: 14px;
  gap: 16px;
  border: 2px solid ${p => p.theme.defaultBg};
  border-radius: 9px;
  background-color: ${p => p.theme.defaultBg};
  box-shadow: ${p => p.theme.shadow.elevation1};

  > .mdi-icon {
    flex: none;
    align-self: center;
    margin-block: -8px;
    color: ${p => p.theme.defaultFg};
  }

  > div {
    flex: 1 1 auto;
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

  &:focus,
  &:focus-visible {
    border-color: ${p => p.theme.focus.color};
    border-radius: 9px;
    box-shadow: ${p => p.theme.shadow.elevation1};
  }

  &:hover {
    box-shadow: ${p => p.theme.shadow.elevation3};
  }
`;

export type TitleProps = {
  wrap?: boolean;
};

// The weird margins and paddings inside the title are to enable focus
// rectangles for embedded links even when props.wrap is falsy. Without
// a bit of extra padding, the link's focus rectangle gets cut off by
// overflow: hidden.

export const Title = styled.p<TitleProps>`
  margin: -4px;
  padding: 4px;
  font-size: 18px;
  line-height: 20px;

  ${p => !p.wrap && `
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  `}

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
  color: ${p => p.theme.defaultFg};

  > :first-child {
    margin-top: 0;
  }

  > :last-child {
    margin-bottom: 0;
  }
`;
