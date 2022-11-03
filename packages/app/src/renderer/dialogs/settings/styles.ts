import styled from 'styled-components';

import {BodyText} from '@condict/ui';

import {NakedButton} from '../../ui';

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
  background-color: var(--bg-alt);

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
    background-color: var(--bg-hover);
  }

  &:active {
    background-color: var(--bg-pressed);
  }

  &:focus {
    outline: none;

    &::after {
      content: '';
      position: absolute;
      inset-block: 1px;
      inset-inline: 8px;
      border: 2px solid var(--focus-border);
      border-radius: 4px;
    }
  }

  ${p => p.isCurrent && `
    &::before {
      content: '';
      position: absolute;
      inset-block: 2px;
      inset-inline-start: 2px;
      border-left: 4px solid var(--border-accent);
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

export const CloseButton = styled(NakedButton)`
  padding: 6px;
  position: absolute;
  top: 8px;
  inset-inline-end: 8px;

  border-radius: 50%;

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

  > p:last-child {
    margin-bottom: 0;
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

export const OptionDescription = styled(BodyText)`
  margin-inline-start: 24px;
  opacity: 0.7;
`;

export const TextSizeOptions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: flex-start;
  max-width: 760px;

  &:not(:last-child) {
    margin-bottom: 24px;
  }

  > ${OptionGroup} {
    flex: 1 1 50%;
    margin-bottom: 0;
  }
`;

export const IntroText = styled(BodyText).attrs({
  as: 'p' as const,
})`
  margin-bottom: 20px;
`;
