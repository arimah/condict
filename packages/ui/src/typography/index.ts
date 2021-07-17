import styled from 'styled-components';

export type BodyTextProps = {
  underlineLinks?: boolean;
};

export const BodyText = styled.div<BodyTextProps>`
  line-height: 20px;

  /* Headings have their own line-height that is good enough. */

  ${p => p.underlineLinks && `
    a:link,
    a:visited,
    a:hover,
    a:active {
      text-decoration: underline;
    }
  `}
`;
