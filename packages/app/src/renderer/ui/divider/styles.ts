import styled from 'styled-components';

// Note: we can't use <hr> here, as that is a void element. We want to support
// text inside dividers.
export const Divider = styled.div.attrs({
  role: 'separator' as const,
})`
  display: block;
  margin-block: 28px;
  position: relative;
  border-bottom: 2px solid var(--border);

  > span {
    padding-inline: 8px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-transform: uppercase;
    background-color: var(--bg);
    color: var(--fg);
  }
`;
