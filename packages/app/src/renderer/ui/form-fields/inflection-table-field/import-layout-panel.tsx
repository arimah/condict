import {Fragment, useState, useMemo, useCallback} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import OpenLinkIcon from 'mdi-react/OpenInNewIcon';

import {useUniqueId} from '@condict/ui';
import {InflectionTableJson} from '@condict/table-editor';

import {EventPredicate, useData, useExecute} from '../../../data';
import {PanelParams, PanelProps} from '../../../navigation';
import {LanguageId, PartOfSpeechId, InflectionTableId} from '../../../graphql';
import {InflectionTablePage, LanguagePage} from '../../../page';

import DataViewer from '../../data-viewer';
import Loading from '../../loading';
import {InflectionTableIcon} from '../../resource-icons';
import {FlowContent, HeaderAction, MainHeader} from '../../styles';

import {AllTableLayoutsQuery, TableLayoutQuery} from './query';
import {InflectionTableValue} from './types';
import * as S from './styles';

type Props = {
  languageId: LanguageId;
  partOfSpeechId: PartOfSpeechId;
  inflectionTableId: InflectionTableId | null;
} & PanelProps<InflectionTableValue | null>;

interface TableGroup {
  id: PartOfSpeechId;
  name: string;
  tables: InflectionTablePage[];
}

type SubmitState = 'loading' | 'error' | null;

const ImportLayoutPanel = (props: Props): JSX.Element => {
  const {languageId, partOfSpeechId, inflectionTableId, onResolve} = props;

  const [submitState, setSubmitState] = useState<SubmitState>(null);

  const data = useData(AllTableLayoutsQuery, {lang: languageId}, shouldReload);

  const groups = useMemo(() => {
    if (data.state === 'loading' || !data.result.data?.language) {
      return {samePos: null, otherPos: []};
    }

    const {language} = data.result.data;
    const langPage = LanguagePage(language.id, language.name);

    let samePos: TableGroup | null = null;
    const otherPos: TableGroup[] = [];

    for (const pos of language.partsOfSpeech) {
      const tables: InflectionTablePage[] = [];

      for (const table of pos.inflectionTables) {
        if (table.id === inflectionTableId) {
          // Disallow imports from the same table.
          continue;
        }
        tables.push(InflectionTablePage(table.id, table.name, langPage));
      }

      if (tables.length === 0) {
        continue;
      }

      const group: TableGroup = {id: pos.id, name: pos.name, tables};
      if (pos.id === partOfSpeechId) {
        samePos = group;
      } else {
        otherPos.push(group);
      }
    }

    return {samePos, otherPos};
  }, [data]);

  const execute = useExecute();
  const handlePickTable = useCallback((id: InflectionTableId) => {
    setSubmitState('loading');

    void execute(TableLayoutQuery, {table: id}).then(result => {
      if (result.errors || !result.data?.inflectionTable) {
        setSubmitState('error');
        return;
      }

      const {layout} = result.data.inflectionTable;
      const rows: InflectionTableJson = layout.rows.map(row => ({
        cells: row.cells.map(cell =>
          'headerText' in cell ? cell : {
            ...cell,
            inflectedForm: {
              ...cell.inflectedForm,
              id: null,
            },
          }
        ),
      }));
      onResolve(InflectionTableValue.fromGraphQLResponse(rows));
    });
  }, [execute, onResolve]);

  const htmlId = useUniqueId();

  return (
    <FlowContent>
      <MainHeader>
        <h1>
          <Localized id='table-editor-import-layout-title'/>
        </h1>
        <HeaderAction onClick={() => onResolve(null)}>
          <Localized id='generic-form-cancel'/>
        </HeaderAction>
      </MainHeader>
      <div role='alert'>
        {submitState === 'loading' && <Loading delay={150}/>}
        {submitState === 'error' &&
          <S.SubmitError>
            <Localized id='table-editor-import-error'/>
          </S.SubmitError>}
      </div>
      <DataViewer
        result={data}
        render={() => {
          const {samePos, otherPos} = groups;
          return <>
            <h2 id={`${htmlId}-same-title`}>
              <Localized id='table-editor-import-same-pos-heading'/>
            </h2>
            {samePos ? (
              <TableList
                aria-labelledby={`${htmlId}-same-title`}
                tables={samePos.tables}
                onPick={handlePickTable}
              />
            ) : (
              <p>
                <Localized id='table-editor-import-same-pos-empty'/>
              </p>
            )}

            <h2 id={`${htmlId}-other-title`}>
              <Localized id='table-editor-import-other-pos-heading'/>
            </h2>
            <section aria-labelledby={`${htmlId}-other-title`}>
              {otherPos.length > 0 ? otherPos.map(pos =>
                <Fragment key={pos.id}>
                  <h3 id={`${htmlId}-${pos.id}-title`}>
                    {pos.name}
                  </h3>
                  <TableList
                    aria-labelledby={`${htmlId}-${pos.id}-title`}
                    tables={pos.tables}
                    onPick={handlePickTable}
                  />
                </Fragment>
              ) : (
                <p>
                  <Localized id='table-editor-import-other-pos-empty'/>
                </p>
              )}
            </section>
          </>;
        }}
      />
    </FlowContent>
  );
};

const shouldReload: EventPredicate = event =>
  event.type === 'language' ||
  event.type === 'partOfSpeech' ||
  event.type === 'inflectionTable';

const importLayoutPanel = (ids: {
  languageId: LanguageId;
  partOfSpeechId: PartOfSpeechId;
  inflectionTableId: InflectionTableId | null;
}): PanelParams<InflectionTableValue | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <ImportLayoutPanel {...props} {...ids}/>,
});

export default importLayoutPanel;

type TableListProps = {
  'aria-labelledby': string;
  tables: InflectionTablePage[];
  onPick: (id: InflectionTableId) => void;
};

const TableList = (props: TableListProps): JSX.Element => {
  const {tables, onPick} = props;

  const {l10n} = useLocalization();

  return (
    <S.TableCardList>
      {tables.map(table =>
        <S.TableCard key={table.id}>
          <S.TableButton onClick={() => onPick(table.id)}>
            <InflectionTableIcon/>
            <span>{table.name}</span>
          </S.TableButton>
          <S.TableLink
            to={table}
            aria-label={l10n.getString('table-editor-import-open-table-button')}
            title={l10n.getString('table-editor-import-open-table-button')}
          >
            <OpenLinkIcon/>
          </S.TableLink>
        </S.TableCard>
      )}
    </S.TableCardList>
  );
};
