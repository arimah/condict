import {useCallback, useEffect} from 'react';
import {Localized} from '@fluent/react';

import {BodyText, useUniqueId} from '@condict/ui';

import {LanguagePage as LanguageTarget, SearchPage} from '../../page';
import {useOpenPanel, useUpdateTab} from '../../navigation';
import {
  DataViewer,
  FlowContent,
  MainHeader,
  HeaderAction,
  Selectable,
  RichContent,
  TagList,
  Tag,
  hasRichContent,
} from '../../ui';
import {LanguageId} from '../../graphql';
import {EventPredicate, useData} from '../../data';
import {useRefocusOnData} from '../../hooks';

import {PageProps} from '../types';

import LanguageQuery from './query';
import LanguageSearch from './language-search';
import LemmaAndDefinitionList from './lemma-and-definition-list';
import PartOfSpeechList from './part-of-speech-list';
import editLanguagePanel from './edit-language-panel';
import addPartOfSpeechPanel from './add-part-of-speech-panel';

export type Props = {
  id: LanguageId;
} & PageProps;

const LanguagePage = (props: Props): JSX.Element => {
  const {id, pageRef} = props;

  const shouldReloadPage = useCallback<EventPredicate>(
    event =>
      event.type === 'language' && event.id === id ||
      (
        event.type === 'definition' ||
        event.type === 'definitionTag' ||
        event.type === 'partOfSpeech' ||
        event.type === 'inflectionTable'
      ) && event.languageId === id,
    [id]
  );

  const data = useData(LanguageQuery, {id}, shouldReloadPage);

  const openPanel = useOpenPanel();
  const handleEditLanguage = useCallback(() => {
    void openPanel(editLanguagePanel(id));
  }, [id]);

  const handleAddPartOfSpeech = useCallback(() => {
    void openPanel(addPartOfSpeechPanel(id));
  }, [id]);

  const updateTab = useUpdateTab();
  const title = data.state === 'data' && data.result.data?.language?.name;
  useEffect(() => {
    if (title) {
      updateTab({title});
    }
  }, [title]);

  const htmlId = useUniqueId();

  useRefocusOnData(data, {ownedElem: pageRef});

  return (
    <FlowContent>
      <DataViewer
        result={data}
        render={({language}) => {
          if (!language) {
            return (
              <p>
                <Localized id='language-not-found-error'/>
              </p>
            );
          }

          const langPage = LanguageTarget(id, language.name);
          return <>
            <MainHeader>
              <Selectable as='h1'>{language.name}</Selectable>
              <HeaderAction onClick={handleEditLanguage}>
                <Localized id='generic-edit-button'/>
              </HeaderAction>
            </MainHeader>

            <LanguageSearch id={id} name={language.name}/>

            <LemmaAndDefinitionList
              parent={langPage}
              lemmaCount={language.lemmaCount}
              firstWord={language.firstLemma?.term}
              lastWord={language.lastLemma?.term}
              recentDefinitions={language.recentDefinitions.nodes}
              htmlId={htmlId}
              onAddDefinition={() => {/* TODO */}}
            />

            {hasRichContent(language.description) && <>
              <h2>
                <Localized id='language-about-heading'/>
              </h2>
              <Selectable as={BodyText}>
                <RichContent
                  value={language.description}
                  heading1='h3'
                  heading2='h4'
                />
              </Selectable>
            </>}

            <h2 id={`${htmlId}-pos-title`}>
              <Localized id='language-parts-of-speech-heading'/>
            </h2>
            <PartOfSpeechList
              aria-labelledby={`${htmlId}-pos-title`}
              parent={langPage}
              partsOfSpeech={language.partsOfSpeech}
              onAddPartOfSpeech={handleAddPartOfSpeech}
            />

            <h2 id={`${htmlId}-tags-title`}>
              <Localized id='language-tags-heading'/>
            </h2>
            <section aria-labelledby={`${htmlId}-tags-title`}>
              {language.tags.nodes.length > 0 ? (
                <TagList>
                  {language.tags.nodes.map(tag =>
                    <li key={tag.id}>
                      <Tag
                        linkTo={SearchPage('', {
                          tag: tag.id,
                          language: id,
                        })}
                        name={tag.name}
                      />
                    </li>
                  )}
                </TagList>
              ) : (
                <BodyText as='p'>
                  <Localized id='language-no-tags-description'/>
                </BodyText>
              )}
            </section>
          </>;
        }}
      />
    </FlowContent>
  );
};

export default LanguagePage;
