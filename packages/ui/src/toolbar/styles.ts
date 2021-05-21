import styled, {css} from 'styled-components';

export type ButtonProps = {
  checked?: boolean;
  menuOpen?: boolean;
};

export const Toolbar = styled.div.attrs({
  role: 'toolbar',
})`
  display: flex;
  flex-direction: row;
  padding: 2px;
  flex-wrap: wrap;
  border-radius: 5px;
  background-color: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};
`;

export const Group = styled.div.attrs({
  role: 'group' as string | undefined,
})`
  display: flex;
  flex: none;
  flex-direction: row;
  flex-wrap: wrap;

  &:not(:last-child) {
    margin-right: 16px;
  }
`;

export const Button = styled.button.attrs({
  type: 'button',
})<ButtonProps>`
  flex: none;
  padding: 6px 8px;
  font: inherit;
  font-weight: normal;
  text-align: center;
  border: none;
  border-radius: 4px;
  background-color: ${p => p.theme.general.bg};
  color: ${p => p.theme.general.fg};

  &:not(:first-child) {
    margin-left: 2px;
  }

  &:focus,
  &.force-focus {
    outline: none;
    padding: 4px 6px;
    border: 2px solid ${p => p.theme.focus.color};
    box-shadow: ${p => p.theme.focus.shadow};
  }

  &:hover {
    background-color: ${p => p.theme.general.hoverBg};
  }

  &:active {
    background-color: ${p => p.theme.general.activeBg};
  }

  ${p => p.checked && css`
    && {
      background-color: ${p => p.theme.accent.bg};
      box-shadow:
        inset 0 1px 2px rgba(0, 0, 0, ${p => p.theme.mode === 'dark'
          ? '0.75'
          : '0.4'
        });
    }

    &&:focus,
    &&.force-focus {
      box-shadow:
        ${p => p.theme.focus.shadow},
        inset 0 1px 2px rgba(0, 0, 0, ${p => p.theme.mode === 'dark'
          ? '0.75'
          : '0.4'
        });
    }
  `}

  ${p => p.menuOpen && css`
    && {
      background-color: ${p => p.theme.general.activeBg};
    }
  `}

  &:disabled {
    background-color: ${p => p.theme.general.bg};
    color: ${p => p.theme.general.disabledFg};
  }

  > .mdi-icon {
    margin-top: -4px;
    margin-bottom: -4px;
    vertical-align: -3px;

    :first-child {
      margin-left: -4px;
    }
    :last-child {
      margin-right: -4px;
    }
  }
`;

export const Spacer = styled.div`
  flex: 1 0 auto;
`;

export const SelectLabel = styled.label`
  flex: none;
  padding-top: 2px;
  padding-bottom: 2px;
`;
