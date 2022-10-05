import styled from 'styled-components';

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
  border-radius: 7px;
  background: var(--bg);
  color: var(--fg);

  ${p => p.minimal ? `
    padding: 16px 24px;
  ` : `
    padding: 14px 22px;
    border: 2px solid var(--border);
    box-shadow: var(--shadow-elevation-1);
  `}

  &:focus {
    outline: none;
    border-color: var(--focus-border);
    border-style: var(--focus-border-style);
    box-shadow: var(--focus-shadow);
  }
`;

export const Image = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
`;

export const Title = styled.h2`
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: var(--font-size-xxl);
  line-height: var(--line-height-xxl);
  font-weight: bold;
  text-align: center;
`;

export const Description = styled.p`
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: var(--font-size-mb);
  line-height: var(--line-height-mb);
`;

export const Action = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  text-align: center;
`;
