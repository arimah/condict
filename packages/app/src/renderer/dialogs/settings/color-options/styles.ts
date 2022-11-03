import styled from 'styled-components';

export const Main = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-block: 8px 12px;
  padding-inline-start: 8px;
  gap: 14px;
`;

export const Option = styled.label`
  flex: none;
  margin: -6px;
  padding: 4px;
  position: relative;
  text-align: center;
  border-radius: 7px;
  border: 2px solid transparent;
  background-color: var(--bg);
  color: var(--fg);

  &:hover {
    --bg: var(--bg-hover);
  }

  &:active {
    --bg: var(--bg-pressed);
  }

  &:focus-within {
    outline: none;
    border-color: var(--focus-border);
  }

  > input {
    appearance: none;
    position: absolute;
    inset: 0;

    &:focus {
      outline: none;
    }
  }
`;

export const Swatch = styled.span`
  display: block;
  box-sizing: border-box;
  margin-inline: auto;
  position: relative;
  width: 60px;
  height: 36px;
  border-radius: 18px;
  border: 2px solid var(--bg);

  input:checked + & {
    border-color: transparent;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 2px solid var(--bg);
      border-radius: 16px;
    }
  }
`;

export const ColorName = styled.span`
  display: block;
  margin-top: 4px;
`;
