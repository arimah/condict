import {useCallback} from 'react';
import {Localized, useLocalization} from '@fluent/react';

import {useUniqueId} from '@condict/ui';

import {DataViewer, FlowContent, Tag, TagList} from '../../ui';
import {useOpenPanel} from '../../navigation';
import {EventPredicate, useData} from '../../data';
import {useRefocusOnData} from '../../hooks';

import {PageProps} from '../types';

import HomeQuery from './query';
import LanguageList from './language-list';
import RecentChangeCard from './recent-change-card';
import addLanguagePanel from './add-language-panel';
import * as S from './styles';

const HomePage = (props: PageProps): JSX.Element => {
  const data = useData(HomeQuery, {tagsPage: 0}, shouldReload);

  const {l10n} = useLocalization();

  const openPanel = useOpenPanel();
  const handleAddLanguage = useCallback(() => {
    void openPanel(addLanguagePanel(l10n));
  }, [l10n]);

  const id = useUniqueId();

  useRefocusOnData(data, {ownedElem: props.pageRef});

  return (
    <DataViewer
      result={data}
      render={({languages, tags, recentChanges}) =>
        <FlowContent>
          <h1 id={`${id}-languages-title`}>
            <Localized id='home-languages-title'/>
          </h1>
          <LanguageList
            aria-labelledby={`${id}-languages-title`}
            languages={languages}
            onAddLanguage={handleAddLanguage}
          />

          <h1 id={`${id}-tags-title`}>
            <Localized id='home-tags-title'/>
          </h1>
          <section aria-labelledby={`${id}-tags-title`}>
            {tags.nodes.length > 0 ? (
              <TagList>
                {tags.nodes.map(tag =>
                  <li key={tag.id}>
                    <Tag id={tag.id} name={tag.name}/>
                  </li>
                )}
              </TagList>
            ) : (
              <p>
                <Localized id='home-no-tags-description'/>
              </p>
            )}
          </section>

          <h1 id={`${id}-recent-title`}>
            <Localized id='home-recent-changes-title'/>
          </h1>
          {recentChanges != null && recentChanges.nodes.length > 0 ? (
            <S.RecentChangesList aria-labelledby={`${id}-recent-title`}>
              {recentChanges?.nodes.map((item, index) =>
                <RecentChangeCard key={index} item={item}/>
              )}
            </S.RecentChangesList>
          ) : (
            <p>
              <Localized id='home-no-recent-changes-description'/>
            </p>
          )}
        </FlowContent>
      }
    />
  );
};

export default HomePage;

const shouldReload: EventPredicate = event =>
  // TODO: Add more event types
  event.type === 'language';
