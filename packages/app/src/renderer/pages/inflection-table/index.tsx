import {useCallback, useEffect} from 'react';
import {Localized} from '@fluent/react';

import {SROnly, useUniqueId} from '@condict/ui';

import {InflectionTableId, LanguageId} from '../../graphql';

import {useOpenPanel, useUpdateTab} from '../../navigation';
import {LanguagePage, PartOfSpeechPage} from '../../page';
import {PageProps} from '../types';
import {
  DataViewer,
  FlowContent,
  MainHeader,
  HeaderAction,
  Subheader,
  Selectable,
  Link,
} from '../../ui';
import {EventPredicate, useData} from '../../data';
import {useRefocusOnData} from '../../hooks';
import {editInflectionTablePanel} from '../../panels';

import TableLayout from './table-layout';
import InflectionTableQuery from './query';
import * as S from './styles';

export type Props = {
  id: InflectionTableId;
  languageId: LanguageId;
} & PageProps;

const InflectionTablePage = (props: Props): JSX.Element => {
  const {id, languageId, pageRef} = props;

  const shouldReloadPage = useCallback<EventPredicate>(
    event =>
      event.type === 'inflectionTable' && event.id === id ||
      event.type === 'partOfSpeech' && event.languageId === languageId ||
      event.type === 'definition' && event.languageId === languageId ||
      event.type === 'language' && event.id === languageId,
    [id, languageId]
  );

  const data = useData(InflectionTableQuery, {id}, shouldReloadPage);

  const openPanel = useOpenPanel();
  const handleEdit = useCallback(() => {
    void openPanel(editInflectionTablePanel(id));
  }, [id]);

  const updateTab = useUpdateTab();
  const title =
    data.state === 'data' &&
    data.result.data?.inflectionTable?.name;
  useEffect(() => {
    if (title) {
      updateTab({title});
    }
  }, [title]);

  const htmlId = useUniqueId();

  useRefocusOnData(data, {
    isEmpty: data => data.inflectionTable === null,
    ownedElem: pageRef,
  });

  return (
    <FlowContent>
      <DataViewer
        result={data}
        render={({inflectionTable: table}) => {
          if (!table) {
            return (
              <p>
                <Localized id='inflection-table-not-found-error'/>
              </p>
            );
          }

          const pos = table.partOfSpeech;
          const lang = pos.language;
          const langPage = LanguagePage(lang.id, lang.name);
          const posPage = PartOfSpeechPage(pos.id, pos.name, langPage);
          return <>
            <MainHeader>
              <Selectable as='h1'>{table.name}</Selectable>
              <HeaderAction onClick={handleEdit}>
                <Localized id='generic-edit-button'/>
              </HeaderAction>
            </MainHeader>
            <Subheader>
              <Localized
                id='inflection-table-subheading'
                vars={{partOfSpeech: pos.name, language: lang.name}}
                elems={{
                  'pos-link': <Link to={posPage}/>,
                  'lang-link': <Link to={langPage}/>,
                }}
              >
                <></>
              </Localized>
            </Subheader>

            <SROnly as='h2' id={`${htmlId}-layout-title`}>
              <Localized id='inflection-table-layout-heading'/>
            </SROnly>
            <S.TableContainer aria-labelledby={`${htmlId}-layout-title`}>
              <TableLayout layout={table.layout}/>
            </S.TableContainer>
          </>;
        }}
      />
    </FlowContent>
  );
};

export default InflectionTablePage;
