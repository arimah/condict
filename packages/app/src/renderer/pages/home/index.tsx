import {useCallback} from 'react';
import {Localized} from '@fluent/react';
import AddIcon from 'mdi-react/PlusIcon';

import {Button, ConlangFlag, NonIdealState, useUniqueId} from '@condict/ui';

import {DataViewer, FlowContent, CardList, Tag, TagList} from '../../ui';
import {useNavigateTo, useOpenPanel} from '../../navigation';
import {LanguagePage} from '../../page';
import {EventPredicate} from '../../data';
import {addLanguagePanel} from '../../panels';

import usePageData from '../page-data';
import {PageProps} from '../types';

import HomeQuery from './query';
import LanguageList from './language-list';
import RecentChangeCard from './recent-change-card';
import * as S from './styles';

const HomePage = (props: PageProps): JSX.Element => {
  const data = usePageData(HomeQuery, {
    args: {tagsPage: 0},
    reloadOn: shouldReload,
    pageRef: props.pageRef,
  });

  const navigateTo = useNavigateTo();
  const openPanel = useOpenPanel();
  const handleAddLanguage = useCallback(() => {
    void openPanel(addLanguagePanel).then(language => {
      if (language) {
        navigateTo(LanguagePage(language.id, language.name), {
          openInNewTab: true,
          openInBackground: false,
        });
      }
    });
  }, [openPanel]);

  const id = useUniqueId();

  return (
    <DataViewer
      result={data}
      render={({languages, tags, recentChanges}) =>
        <FlowContent>
          {languages.length === 0 ? (
            // If there are no languages, show *only* a prompt to create the
            // first one. Everything else is disclosed later; the user can't
            // really do anything until they've created a language anyway.
            <CardList>
              <NonIdealState
                minimal
                image={<ConlangFlag width={188} height={116}/>}
                title={<Localized id='home-no-languages-heading'/>}
                description={<Localized id='home-no-languages-description'/>}
                action={
                  <Button intent='accent' onClick={handleAddLanguage}>
                    <AddIcon/>
                    <span>
                      <Localized id='home-add-language-button'/>
                    </span>
                  </Button>
                }
              />
            </CardList>
          ) : <>
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
          </>}
        </FlowContent>
      }
    />
  );
};

export default HomePage;

const shouldReload: EventPredicate = event =>
  // The home page shows a summary of the dictionary as well as recent changes,
  // so we have to reload on almost any kind of event.
  event.type === 'language' ||
  event.type === 'lemma' ||
  event.type === 'definition' ||
  event.type === 'partOfSpeech' ||
  event.type === 'inflectionTable' ||
  event.type === 'tag';
