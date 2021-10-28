import {useCallback, useEffect} from 'react';
import {Localized} from '@fluent/react';

import {useUniqueId} from '@condict/ui';

import {LanguagePage, LemmaPage, SearchPage} from '../../page';
import {useOpenPanel, useUpdateTab} from '../../navigation';
import {
  DataViewer,
  FlowContent,
  MainHeader,
  HeaderAction,
  Subheader,
  ResourceMeta,
  ResourceTime,
  Selectable,
  RichContent,
  TagList,
  Tag,
  Link,
} from '../../ui';
import {DefinitionId, LanguageId} from '../../graphql';
import {EventPredicate, useData} from '../../data';
import {useRefocusOnData} from '../../hooks';
import {editDefinitionPanel} from '../../panels';

import {PageProps} from '../types';

import DefinitionQuery from './query';
import Inflection from './inflection';

export type Props = {
  id: DefinitionId;
  languageId: LanguageId;
} & PageProps;

const DefinitionPage = (props: Props): JSX.Element => {
  const {id, languageId, pageRef} = props;

  const shouldReloadPage = useCallback<EventPredicate>(
    event =>
      event.type === 'definition' && event.id === id ||
      event.type === 'language' && event.id === languageId ||
      (
        event.type === 'partOfSpeech' ||
        event.type === 'inflectionTable'
      ) && event.languageId === languageId,
    [id]
  );

  const data = useData(DefinitionQuery, {id}, shouldReloadPage);

  const openPanel = useOpenPanel();
  const handleEdit = useCallback(() => {
    void openPanel(editDefinitionPanel(id));
  }, [id]);

  const updateTab = useUpdateTab();
  const title = data.state === 'data' && data.result.data?.definition?.term;
  useEffect(() => {
    if (title) {
      updateTab({title});
    }
  }, [title]);

  const htmlId = useUniqueId();

  useRefocusOnData(data, {
    isEmpty: data => data.definition === null,
    ownedElem: pageRef,
  });

  return (
    <FlowContent>
      <DataViewer
        result={data}
        render={({definition: def}) => {
          if (!def) {
            return (
              <p>
                <Localized id='definition-not-found-error'/>
              </p>
            );
          }

          const lang = def.language;
          const langPage = LanguagePage(lang.id, lang.name);
          const lemmaPage = LemmaPage(def.lemma.id, def.term, langPage);
          return <>
            <MainHeader>
              <Selectable as='h1'>{def.term}</Selectable>
              <HeaderAction onClick={handleEdit}>
                <Localized id='generic-edit-button'/>
              </HeaderAction>
            </MainHeader>
            <Subheader>
              <Localized
                id='definition-subheading'
                vars={{
                  term: def.term,
                  language: lang.name,
                  defCount: def.lemma.definitions.length,
                }}
                elems={{
                  'lemma-link': <Link to={lemmaPage}/>,
                  'lang-link': <Link to={langPage}/>,
                }}
              >
                <span></span>
              </Localized>
              <ResourceMeta>
                <ResourceTime
                  of={def}
                  createdLabelId='definition-added-on'
                  updatedLabelId='definition-edited-on'
                />
              </ResourceMeta>
            </Subheader>

            <section>
              <h2>
                {def.partOfSpeech.name}
              </h2>
              <RichContent
                value={def.description}
                heading1='h3'
                heading2='h4'
                selectable
              />
            </section>

            {def.inflectionTables.length > 0 &&
              <Inflection
                id={`${htmlId}-tables`}
                term={def.term}
                stems={def.stems}
                tables={def.inflectionTables}
                parent={langPage}
              />}

            {def.tags.length > 0 &&
              <section aria-labelledby={`${htmlId}-tags`}>
                <h2 id={`${htmlId}-tags`}>
                  <Localized id='definition-tags-heading'/>
                </h2>
                <TagList>
                  {def.tags.map(tag =>
                    <li key={tag.id}>
                      <Tag
                        linkTo={SearchPage('', {tag: tag.id, language: lang.id})}
                        name={tag.name}
                      />
                    </li>
                  )}
                </TagList>
              </section>}
          </>;
        }}
      />
    </FlowContent>
  );
};

export default DefinitionPage;
