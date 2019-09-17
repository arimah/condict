import styled from 'styled-components';

export const BodyText = styled.div`
  line-height: 1.5;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    /* Headings have enough spacing around them as it is. */
    line-height: normal;
  }

  a:link,
  a:visited,
  a:hover,
  a:active {
    text-decoration: underline;
  }
`;
