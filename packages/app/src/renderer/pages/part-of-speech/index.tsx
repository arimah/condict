import {useCallback} from 'react';
import {Localized} from '@fluent/react';

import {useNavigateTo, useOpenPanel} from '../../navigation';
import {
  LanguagePage,
  PartOfSpeechPage as PartOfSpeechTarget,
  InflectionTablePage,
} from '../../page';
import {
  FlowContent,
  MainHeader,
  HeaderAction,
  Subheader,
  ResourceMeta,
  ResourceTime,
  Selectable,
  Link,
  renderData,
} from '../../ui';
import {PartOfSpeechId, LanguageId} from '../../graphql';
import {editPartOfSpeechPanel, addInflectionTablePanel} from '../../panels';

import usePageData from '../page-data';
import {PageProps} from '../types';

import InflectionTableList from './inflection-table-list';
import DefinitionList from './definition-list';
import PartOfSpeechQuery from './query';

export type Props = {
  id: PartOfSpeechId;
  languageId: LanguageId;
} & PageProps;

const PartOfSpeechPage = (props: Props): JSX.Element => {
  const {id, languageId, pageRef} = props;

  const data = usePageData(PartOfSpeechQuery, {
    args: {id},
    isEmpty: data => data.partOfSpeech === null,
    pageTitle: data => data.partOfSpeech?.name,
    reloadOn: event => (
      event.type === 'partOfSpeech' && event.id === id ||
      event.type === 'inflectionTable' && event.partOfSpeechId === id ||
      event.type === 'definition' && (
        event.partOfSpeechId === id ||
        event.action === 'update' && event.prevPartOfSpeechId === id
      ) ||
      event.type === 'language' && event.id === languageId
    ),
    pageRef,
  });

  const openPanel = useOpenPanel();
  const handleEditPartOfSpeech = useCallback(() => {
    void openPanel(editPartOfSpeechPanel(id));
  }, [id]);

  const navigateTo = useNavigateTo();
  const handleAddTable = useCallback(() => {
    void openPanel(addInflectionTablePanel({
      languageId,
      partOfSpeechId: id,
    })).then(table => {
      if (table) {
        const lang = table.partOfSpeech.language;
        const langPage = LanguagePage(lang.id, lang.name);
        navigateTo(InflectionTablePage(table.id, table.name, langPage), {
          openInNewTab: true,
          openInBackground: false,
        });
      }
    });
  }, [id]);

  return (
    <FlowContent>
      {renderData(data, ({partOfSpeech: pos}) => {
        if (!pos) {
          return (
            <p>
              <Localized id='part-of-speech-not-found-error'/>
            </p>
          );
        }

        const lang = pos.language;
        const langPage = LanguagePage(lang.id, lang.name);
        const usedBy = pos.usedByDefinitions;
        return <>
          <MainHeader>
            <Selectable as='h1'>{pos.name}</Selectable>
            <HeaderAction onClick={handleEditPartOfSpeech}>
              <Localized id='generic-edit-button'/>
            </HeaderAction>
          </MainHeader>
          <Subheader>
            <Localized
              id='part-of-speech-subheading'
              vars={{language: lang.name}}
              elems={{'lang-link': <Link to={langPage}/>}}
            >
              <span></span>
            </Localized>
            <ResourceMeta>
              <ResourceTime
                of={pos}
                createdLabelId='part-of-speech-added-on'
                updatedLabelId='part-of-speech-edited-on'
              />
            </ResourceMeta>
          </Subheader>

          <InflectionTableList
            language={langPage}
            tables={pos.inflectionTables}
            onAddTable={handleAddTable}
          />

          <DefinitionList
            definitions={usedBy}
            parent={PartOfSpeechTarget(id, pos.name, langPage)}
          />
        </>;
      })}
    </FlowContent>
  );
};

export default PartOfSpeechPage;
