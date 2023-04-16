import {useCallback} from 'react';
import {Localized} from '@fluent/react';

import {SROnly, useUniqueId} from '@condict/ui';

import {InflectionTableId, LanguageId} from '../../graphql';

import {useOpenPanel} from '../../navigation';
import {
  LanguagePage,
  InflectionTablePage as InflectionTableTarget,
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
import {editInflectionTablePanel} from '../../panels';

import usePageData from '../page-data';
import {PageProps} from '../types';

import TableLayout from './table-layout';
import DefinitionList from './definition-list';
import InflectionTableQuery from './query';
import * as S from './styles';

export type Props = {
  id: InflectionTableId;
  languageId: LanguageId;
} & PageProps;

const InflectionTablePage = (props: Props): JSX.Element => {
  const {id, languageId, pageRef} = props;

  const data = usePageData(InflectionTableQuery, {
    args: {id},
    isEmpty: data => data.inflectionTable === null,
    pageTitle: data => data.inflectionTable?.name,
    reloadOn: event => (
      event.type === 'inflectionTable' && event.id === id ||
      event.type === 'partOfSpeech' && event.languageId === languageId ||
      event.type === 'definition' && event.languageId === languageId ||
      event.type === 'language' && event.id === languageId
    ),
    pageRef,
  });

  const openPanel = useOpenPanel();
  const handleEdit = useCallback(() => {
    void openPanel(editInflectionTablePanel(id));
  }, [id]);

  const htmlId = useUniqueId();

  return (
    <FlowContent>
      {renderData(data, ({inflectionTable: table}) => {
        if (!table) {
          return (
            <p>
              <Localized id='inflection-table-not-found-error'/>
            </p>
          );
        }

        const lang = table.language;
        const langPage = LanguagePage(lang.id, lang.name);
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
              vars={{language: lang.name}}
              elems={{'lang-link': <Link to={langPage}/>}}
            >
              <span></span>
            </Localized>
            <ResourceMeta>
              <ResourceTime
                of={table}
                createdLabelId='inflection-table-added-on'
                updatedLabelId='inflection-table-edited-on'
              />
            </ResourceMeta>
          </Subheader>

          <SROnly as='h2' id={`${htmlId}-layout-title`}>
            <Localized id='inflection-table-layout-heading'/>
          </SROnly>
          <S.TableContainer aria-labelledby={`${htmlId}-layout-title`}>
            <TableLayout layout={table.layout}/>
          </S.TableContainer>

          <DefinitionList
            usedBy={table.usedBy}
            oldUsedBy={table.oldUsedBy}
            oldLayoutCount={table.oldLayouts.page.totalCount}
            parent={InflectionTableTarget(id, table.name, langPage)}
          />
        </>;
      })}
    </FlowContent>
  );
};

export default InflectionTablePage;
