import styled, {css} from 'styled-components';

import {Button} from '@condict/ui';

import StandardDialog from '../standard-dialog';

export const Main = styled(StandardDialog)`
  display: grid;
  padding: 0;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  overflow: hidden;

  width: calc(100vw - 96px);
  height: calc(100vh - 96px);
  max-width: 1200px;
  max-height: 860px;
`;

export const Title = styled.h2`
  margin-block: 0 16px;
`;

export const Sidebar = styled.nav`
  box-sizing: border-box;
  padding-block: 20px;
  width: 260px;
  grid-row: 1 / span 2;
  grid-column: 1;
  background-color: ${p => p.theme.general.bg};

  > ${Title} {
    padding-inline-start: 20px;
  }
`;

export const TabList = styled.div.attrs({
  role: 'tablist',
  'aria-orientation': 'vertical',
})``;

export type TabProps = {
  isCurrent: boolean;
};

export const Tab = styled.div.attrs({
  role: 'tab',
})<TabProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
  padding-block: 4px;
  padding-inline: 20px 16px;
  position: relative;

  &:hover {
    background-color: ${p => p.theme.general.hoverBg};
  }

  &:active {
    background-color: ${p => p.theme.general.activeBg};
  }

  &:focus {
    outline: none;

    &::after {
      content: '';
      position: absolute;
      inset-block: 2px;
      inset-inline: 8px;
      border: 2px solid ${p => p.theme.focus.color};
      border-radius: 3px;
    }
  }

  ${p => p.isCurrent && css`
    &::before {
      content: '';
      position: absolute;
      inset-block: 2px;
      inset-inline-start: 0;
      border-left: 4px solid ${p => p.theme.accent.boldBg};
    }
  `}

  > .mdi-icon {
    flex: none;
    margin-inline-end: 8px;
  }
`;

export type SectionProps = {
  isCurrent: boolean;
};

export const Section = styled.main.attrs({
  role: 'tabpanel',
})<SectionProps>`
  display: ${p => p.isCurrent ? 'block' : 'none'};
  padding: 8px 20px 16px;
  max-height: 100%;
  grid-row: 2;
  grid-column: 2;
  overflow-x: visible;
  overflow-y: auto;
`;

export const SectionTitle = styled.h2<SectionProps>`
  display: ${p => p.isCurrent ? 'block' : 'none'};
  margin: 0;
  padding: 20px 20px 8px;
  grid-row: 1;
  grid-column: 2;
`;

export const CloseButton = styled(Button)`
  padding: 6px;
  position: absolute;
  top: 8px;
  inset-inline-end: 8px;

  border-radius: 50%;
  border-color: ${p => p.theme.defaultBg};
  background-color: ${p => p.theme.defaultBg};

  &:hover {
    border-color: ${p => p.theme.defaultHoverBg};
    background-color: ${p => p.theme.defaultHoverBg};
  }

  &:active {
    border-color: ${p => p.theme.defaultActiveBg};
    background-color: ${p => p.theme.defaultActiveBg};
  }

  &:focus {
    border-color: ${p => p.theme.focus.color};
  }

  && > .mdi-icon {
    display: block;
    margin: 0;
  }
`;

export const OptionGroup = styled.div.attrs({
  role: 'group',
})`
  &:not(:last-child) {
    margin-bottom: 24px;
  }
`;

export const OptionGroupName = styled.p`
  font-weight: bold;
`;

export const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-block: 8px;
  margin-inline-start: 8px;
  gap: 8px;
`;

export const OptionDescription = styled.div`
  margin-inline-start: 24px;
  opacity: 0.7;
`;

export const IntroText = styled.p`
  margin-bottom: 20px;
`;
