import styled from 'styled-components';

export type BodyTextProps = {
  underlineLinks?: boolean;
};

export const BodyText = styled.div<BodyTextProps>`
  line-height: 20px;
  white-space: pre-wrap;

  /* Headings have their own line-height that is good enough. */

  sup {
    font-size: 12px;
    line-height: 13px;
    vertical-align: 4px;
  }

  sub {
    font-size: 12px;
    line-height: 13px;
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
