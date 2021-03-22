import styled, {css} from 'styled-components';

export type Props = {
  minimal?: boolean;
};

export const Main = styled.div.attrs({
  role: 'group',
})<Props>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px auto;
  width: 260px;
  border-radius: 3px;
  background: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};

  ${p => p.minimal ? css`
    padding: 16px 24px;
  ` : css`
    padding: 14px 22px;
    border: 2px solid ${p => p.theme.general.borderColor};
    box-shadow: ${p => p.theme.shadow.elevation1};
  `}

  &:focus {
    ${p => p.theme.focus.style}
    border-color: ${p => p.theme.focus.color};
  }
`;

export const Image = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
`;

export const Title = styled.h2`
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 20px;
  line-height: 24px;
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
