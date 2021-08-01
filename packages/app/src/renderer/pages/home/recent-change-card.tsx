import {ReactNode} from 'react';
import {Localized} from '@fluent/react';

import {OperationResult} from '../../graphql';
import {Card, Link, ResourceIcon, ResourceType} from '../../ui';
import {
  Page,
  LanguagePage,
  DefinitionPage,
  PartOfSpeechPage,
  InflectionTablePage,
} from '../../page';

import HomeQuery from './query';
import * as S from './styles';

export type Props = {
  item: RecentChange;
};

type RecentChanges =
  NonNullable<
    OperationResult<typeof HomeQuery>['recentChanges']
  >['nodes'];

type RecentChange = RecentChanges extends (infer T)[] ? T : never;

const RecentChangeCard = ({item}: Props): JSX.Element => {
  let page: Page;
  let name: string;
  let iconType: ResourceType;
  let description: ReactNode;
  switch (item.__typename) {
    case 'Language':
      name = item.name;
      iconType = 'language';
      page = LanguagePage(item.languageId, name);
      description =
        <Localized id='home-recent-language-description'/>;
      break;
    case 'Definition': {
      name = item.term;
      iconType = 'definition';

      const langPage = LanguagePage(item.language.id, item.language.name);
      page = DefinitionPage(item.definitionId, name, langPage);
      description =
        <Localized
          id='home-recent-definition-description'
          vars={{language: item.language.name}}
          elems={{'lang-link': <Link to={langPage}/>}}
        >
          <></>
        </Localized>;
      break;
    }
    case 'PartOfSpeech': {
      name = item.name;
      iconType = 'partOfSpeech';

      const langPage = LanguagePage(item.language.id, item.language.name);
      page = PartOfSpeechPage(item.partOfSpeechId, name, langPage);
      description =
        <Localized
          id='home-recent-part-of-speech-description'
          vars={{language: item.language.name}}
          elems={{'lang-link': <Link to={langPage}/>}}
        >
          <></>
        </Localized>;
      break;
    }
    case 'InflectionTable': {
      name = item.name;
      iconType = 'inflectionTable';

      const pos = item.partOfSpeech;
      const lang = pos.language;
      const langPage = LanguagePage(lang.id, lang.name);
      const posPage = PartOfSpeechPage(pos.id, pos.name, langPage);
      page = InflectionTablePage(item.inflectionTableId, name, langPage);
      description =
        <Localized
          id='home-recent-inflection-table-description'
          vars={{partOfSpeech: pos.name, language: lang.name}}
          elems={{
            'pos-link': <Link to={posPage}/>,
            'lang-link': <Link to={langPage}/>,
          }}
        >
          <></>
        </Localized>;
      break;
    }
  }

  // Excepting unusual space-time anomalies or system time changes, timeUpdated
  // should always be >= timeCreated; in other words, it's the most recent.
  const time = new Date(item.timeUpdated);
  return (
    <Card

      title={<Link to={page}>{name}</Link>}
      iconAfter={<ResourceIcon type={iconType}/>}
    >
      <p>{description}</p>
      <S.SecondaryDetail>
        <Localized
          id={
            item.timeCreated == item.timeUpdated
              ? 'home-recent-added-on'
              : 'home-recent-edited-on'
          }
          vars={{time}}
        />
      </S.SecondaryDetail>
    </Card>
  );
};

export default RecentChangeCard;