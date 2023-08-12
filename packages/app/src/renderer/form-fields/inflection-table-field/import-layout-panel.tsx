import {useState, useCallback} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import OpenLinkIcon from 'mdi-react/OpenInNewIcon';

import {InflectionTable, InflectionTableJson} from '@condict/table-editor';

import {useLiveData, useExecute} from '../../data';
import {PanelParams, PanelProps} from '../../navigation';
import {LanguageId, InflectionTableId} from '../../graphql';
import {InflectionTablePage, LanguagePage} from '../../page';
import {
  FlowContent,
  MainHeader,
  HeaderAction,
  InflectionTableIcon,
  Loading,
  renderData,
} from '../../ui';

import {AllTableLayoutsQuery, TableLayoutQuery} from './query';
import * as S from './styles';

type Props = {
  languageId: LanguageId;
  inflectionTableId: InflectionTableId | null;
} & PanelProps<InflectionTable | null>;

type SubmitState = 'loading' | 'error' | null;

const ImportLayoutPanel = (props: Props): JSX.Element => {
  const {
    languageId,
    inflectionTableId,
    titleId,
    onResolve,
  } = props;

  const [submitState, setSubmitState] = useState<SubmitState>(null);

  const data = useLiveData(AllTableLayoutsQuery, {lang: languageId}, {
    shouldReload: event =>
      event.type === 'language' && event.id === languageId ||
      event.type === 'inflectionTable' && event.languageId === languageId,

    mapData: data => {
      const {language} = data;
      if (!language) {
        return [];
      }

      const langPage = LanguagePage(language.id, language.name);
      return (
        language.inflectionTables
          .filter(table => table.id !== inflectionTableId)
          .map(table => InflectionTablePage(table.id, table.name, langPage))
      );
    },
  });

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
      onResolve(InflectionTable.fromJson(rows));
    });
  }, [execute, onResolve]);

  return (
    <FlowContent>
      <MainHeader>
        <h1 id={titleId}>
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
      {renderData(data, tables => {
        if (tables.length === 0) {
          return (
            <p>
              <Localized id='table-editor-import-no-other-tables'/>
            </p>
          );
        }
        return <TableList tables={tables} onPick={handlePickTable}/>;
      })}
    </FlowContent>
  );
};

const importLayoutPanel = (ids: {
  languageId: LanguageId;
  inflectionTableId: InflectionTableId | null;
}): PanelParams<InflectionTable | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <ImportLayoutPanel {...props} {...ids}/>,
});

export default importLayoutPanel;

type TableListProps = {
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
