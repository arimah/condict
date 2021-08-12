import {useCallback, useEffect} from 'react';
import {Localized} from '@fluent/react';

import {useUniqueId} from '@condict/ui';

import {useNavigateTo, useOpenPanel, useUpdateTab} from '../../navigation';
import {LanguagePage} from '../../page';
import {
  DataViewer,
  FlowContent,
  MainHeader,
  HeaderAction,
  Subheader,
  Selectable,
  Link,
} from '../../ui';
import {PartOfSpeechId, LanguageId} from '../../graphql';
import {EventPredicate, useData} from '../../data';
import {useRefocusOnData} from '../../hooks';
import {editPartOfSpeechPanel, addInflectionTablePanel} from '../../panels';

import {PageProps} from '../types';

import InflectionTableList from './inflection-table-list';
import PartOfSpeechQuery from './query';

export type Props = {
  id: PartOfSpeechId;
  languageId: LanguageId;
} & PageProps;

const PartOfSpeechPage = (props: Props): JSX.Element => {
  const {id, languageId, pageRef} = props;

  const shouldReloadPage = useCallback<EventPredicate>(
    event =>
      event.type === 'partOfSpeech' && event.id === id ||
      event.type === 'inflectionTable' && event.partOfSpeechId === id ||
      event.type === 'definition' && event.languageId === languageId ||
      event.type === 'language' && event.id === languageId,
    [id]
  );

  const data = useData(PartOfSpeechQuery, {id}, shouldReloadPage);

  const openPanel = useOpenPanel();
  const handleEditPartOfSpeech = useCallback(() => {
    void openPanel(editPartOfSpeechPanel(id));
  }, [id]);

  const navigateTo = useNavigateTo();
  const handleAddTable = useCallback(() => {
    void openPanel(addInflectionTablePanel(id)).then(table => {
      if (table) {
        navigateTo(table, {
          openInNewTab: true,
          openInBackground: false,
        });
      }
    });
  }, [id]);

  const updateTab = useUpdateTab();
  const title = data.state === 'data' && data.result.data?.partOfSpeech?.name;
  useEffect(() => {
    if (title) {
      updateTab({title});
    }
  }, [title]);

  const htmlId = useUniqueId();

  useRefocusOnData(data, {
    isEmpty: data => data.partOfSpeech === null,
    ownedElem: pageRef,
  });

  return (
    <FlowContent>
      <DataViewer
        result={data}
        render={({partOfSpeech: pos}) => {
          if (!pos) {
            return (
              <p>
                <Localized id='part-of-speech-not-found-error'/>
              </p>
            );
          }

          const lang = pos.language;
          const langPage = LanguagePage(lang.id, lang.name);
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
                <></>
              </Localized>
            </Subheader>

            <h2 id={`${htmlId}-tables-heading`}>
              <Localized id='part-of-speech-tables-heading'/>
            </h2>
            <InflectionTableList
              aria-labelledby={`${htmlId}-tables-heading`}
              language={langPage}
              tables={pos.inflectionTables}
              onAddTable={handleAddTable}
            />
          </>;
        }}
      />
    </FlowContent>
  );
};

export default PartOfSpeechPage;
