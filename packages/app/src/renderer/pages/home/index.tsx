import {useCallback} from 'react';
import {Localized, ReactLocalization, useLocalization} from '@fluent/react';

import {Button, useUniqueId} from '@condict/ui';

import {LanguageId} from '../../graphql';
import {DataViewer, FlowContent, Tag} from '../../ui';
import {PanelParams, PanelProps, useOpenPanel} from '../../navigation';
import {useData} from '../../data';

import HomeQuery from './query';
import LanguageList from './language-list';
import * as S from './styles';
import RecentChangeCard from './recent-change-card';

const HomePage = (): JSX.Element => {
  const data = useData(HomeQuery, {tagsPage: 0});

  const {l10n} = useLocalization();

  const openPanel = useOpenPanel();
  const handleAddLanguage = useCallback(() => {
    void openPanel(addLanguagePanel(l10n));
  }, [l10n]);

  const id = useUniqueId();

  return <>
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
              <S.TagList>
                {tags.nodes.map(tag =>
                  <li key={tag.id}>
                    <Tag id={tag.id} name={tag.name}/>
                  </li>
                )}
              </S.TagList>
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
        </FlowContent>}
    />
  </>;
};

export default HomePage;

const addLanguagePanel = (
  l10n: ReactLocalization
): PanelParams<LanguageId | null> => ({
  initialTitle: l10n.getString('home-add-language-title'),
  // eslint-disable-next-line react/display-name
  render: props => <AddLanguagePanel {...props}/>,
});

const AddLanguagePanel = (props: PanelProps<LanguageId | null>) => {
  const {onResolve} = props;
  return <>
    <h1>
      <Localized id='home-add-language-title'/>
    </h1>
    <p>Here you will be able to add a language.</p>
    <p>
      <Button label='Cancel' onClick={() => onResolve(null)}/>
    </p>
  </>;
};
