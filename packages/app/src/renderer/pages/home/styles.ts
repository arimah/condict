import styled from 'styled-components';

import {BodyText} from '@condict/ui';

import {CardGrid} from '../../ui';

// TODO
export const LanguageList = styled.section`
  margin-block: 8px 16px;

  > :not(:last-child) {
    margin-bottom: 8px;
  }
`;

export const LanguageDesc = styled(BodyText)`
  /* -webkit-line-clamp is only supported with the old, weird -webkit-box. */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;

  > :first-child {
    margin-top: 0;
  }
  > :last-child {
    margin-bottom: 0;
  }
`;

export const TagList = styled.ul`
  display: flex;
  padding: 0;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  list-style-type: none;

  > li {
    margin: 0;
  }
`;

export const RecentChangesList = styled(CardGrid).attrs({
  as: 'section',
})`
  grid-template-columns: 1fr;
  gap: 4px;

  @media (min-width: 960px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

export const SecondaryDetail = styled.p`
  opacity: 0.7;
`;
