import styled from 'styled-components';

export type BodyTextProps = {
  underlineLinks?: boolean;
};

export const BodyText = styled.div<BodyTextProps>`
  font-size: var(--font-size-mb);
  line-height: var(--line-height-mb);

  /* Headings have their own line-height that is good enough. */

  sup,
  sub {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
  }

    sup {
      vertical-align: 4px;
    }

    sub {
      vertical-align: -3px;
    }

  ${p => p.underlineLinks && `
    a:link,
    a:visited,
    a:hover,
    a:active {
      text-decoration: underline;
    }
  `}
`;
