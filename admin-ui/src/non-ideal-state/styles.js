import styled, {css} from 'styled-components';
import {ifProp, theme} from 'styled-tools';

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px auto;
  width: 260px;
  border-radius: 3px;
  background: ${theme('general.bg')};
  color: ${theme('general.fg')};

  ${ifProp('minimal',
    css`
      padding: 16px 24px;
    `,
    css`
      padding: 14px 22px;
      border: 2px solid ${theme('general.borderColor')};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.175);
    `
  )}
`;

export const Image = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
`;

export const Title = styled.h2`
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 1.25em;
  font-weight: bold;
  text-align: center;
`;

export const Description = styled.p`
  margin-top: 8px;
  margin-bottom: 8px;
`;

export const Action = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  text-align: center;
`;
