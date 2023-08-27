import {useCallback} from 'react';
import {Localized} from '@fluent/react';

import {BodyText, useUniqueId} from '@condict/ui';

import {
  LanguagePage as LanguageTarget,
  DefinitionPage,
  PartOfSpeechPage,
  InflectionTablePage,
  SearchPage,
} from '../../page';
import {useNavigateTo, useOpenPanel} from '../../navigation';
import {
  FlowContent,
  MainHeader,
  HeaderAction,
  Subheader,
  ResourceMeta,
  ResourceTime,
  Selectable,
  RichContent,
  TagList,
  renderData,
  hasRichContent,
} from '../../ui';
import {LanguageId} from '../../graphql';
import {
  editLanguagePanel,
  addDefinitionPanel,
  addPartOfSpeechPanel,
  addInflectionTablePanel,
  manageCustomFieldsPanel,
} from '../../panels';

import usePageData from '../page-data';
import {PageProps} from '../types';

import LanguageQuery from './query';
import LanguageSearch from './language-search';
import LemmaAndDefinitionList from './lemma-and-definition-list';
import PartOfSpeechList from './part-of-speech-list';
import InflectionTableList from './inflection-table-list';
import CustomFieldList from './custom-field-list';

export type Props = {
  id: LanguageId;
} & PageProps;

const LanguagePage = (props: Props): JSX.Element => {
  const {id, pageRef} = props;

  const data = usePageData(LanguageQuery, {
    args: {id},
    isEmpty: data => data.language === null,
    pageTitle: data => data.language?.name,
    reloadOn: event => (
      event.type === 'language' && event.id === id ||
      (
        event.type === 'definition' ||
        event.type === 'definitionTag' ||
        event.type === 'partOfSpeech' ||
        event.type === 'inflectionTable' ||
        event.type === 'field' ||
        event.type === 'definitionField'
      ) && event.languageId === id
    ),
    pageRef,
  });

  const navigateTo = useNavigateTo();
  const openPanel = useOpenPanel();
  const handleEditLanguage = useCallback(() => {
    void openPanel(editLanguagePanel(id));
  }, [id]);

  const handleAddDefinition = useCallback(() => {
    void openPanel(addDefinitionPanel(id)).then(def => {
      if (def) {
        const lang = def.language;
        const langPage = LanguageTarget(lang.id, lang.name);
        navigateTo(DefinitionPage(def.id, def.term, langPage), {
          openInNewTab: true,
          openInBackground: false,
        });
      }
    });
  }, [id]);

  const handleAddPartOfSpeech = useCallback(() => {
    void openPanel(addPartOfSpeechPanel(id)).then(pos => {
      if (pos) {
        const lang = pos.language;
        const langPage = LanguageTarget(lang.id, lang.name);
        navigateTo(PartOfSpeechPage(pos.id, pos.name, langPage), {
          openInNewTab: true,
          openInBackground: false,
        });
      }
    });
  }, [id]);

  const handleAddTable = useCallback(() => {
    void openPanel(addInflectionTablePanel({
      languageId: id,
    })).then(table => {
      if (table) {
        const lang = table.language;
        const langPage = LanguageTarget(lang.id, lang.name);
        navigateTo(InflectionTablePage(table.id, table.name, langPage), {
          openInNewTab: true,
          openInBackground: false,
        });
      }
    });
  }, [id]);

  const handleManageFields = useCallback(() => {
    void openPanel(manageCustomFieldsPanel(id));
  }, [id]);

  const htmlId = useUniqueId();

  return (
    <FlowContent>
      {renderData(data, ({language}) => {
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
          <Subheader>
            <ResourceMeta>
              <ResourceTime
                of={language}
                createdLabelId='language-added-on'
                updatedLabelId='language-edited-on'
              />
            </ResourceMeta>
          </Subheader>

          <LanguageSearch id={id} name={language.name}/>

          <LemmaAndDefinitionList
            parent={langPage}
            lemmaCount={language.lemmaCount}
            firstWord={language.firstLemma?.term}
            lastWord={language.lastLemma?.term}
            recentDefinitions={language.recentDefinitions.nodes}
            htmlId={htmlId}
            onAddDefinition={handleAddDefinition}
          />

          {hasRichContent(language.description) && <>
            <h2>
              <Localized id='language-about-heading'/>
            </h2>
            <RichContent
              value={language.description}
              heading1='h3'
              heading2='h4'
              selectable
            />
          </>}

          <PartOfSpeechList
            parent={langPage}
            partsOfSpeech={language.partsOfSpeech}
            onAddPartOfSpeech={handleAddPartOfSpeech}
          />

          <InflectionTableList
            parent={langPage}
            tables={language.inflectionTables}
            onAddTable={handleAddTable}
          />

          <CustomFieldList onManageFields={handleManageFields}/>

          <section>
            <h2>
              <Localized id='language-tags-heading'/>
            </h2>
            {language.tags.nodes.length > 0 ? (
              <TagList
                tags={language.tags.nodes}
                target={t => SearchPage({tag: t.id, language: id})}
              />
            ) : (
              <BodyText as='p'>
                <Localized id='language-no-tags-description'/>
              </BodyText>
            )}
          </section>
        </>;
      })}
    </FlowContent>
  );
};

export default LanguagePage;
