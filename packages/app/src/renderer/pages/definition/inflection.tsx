import {Fragment, useMemo} from 'react';
import {Localized} from '@fluent/react';

import {SROnly} from '@condict/ui';

import {InflectionTablePage, LanguagePage} from '../../page';
import {DefinitionTable, Link} from '../../ui';
import {OperationResult} from '../../graphql';

import DefinitionQuery from './query';
import * as S from './styles';

export type Props = {
  id: string;
  tables: InflectionTables;
  term: string;
  stems: Stems;
  parent: LanguagePage;
};

type Definition = NonNullable<
  OperationResult<typeof DefinitionQuery>['definition']
>;

type InflectionTables = Definition['inflectionTables'];

type Stems = Definition['stems'];

const Inflection = (props: Props): JSX.Element => {
  const {id, tables, term, stems, parent} = props;

  const stemMap = useMemo(() => {
    return new Map(stems.map(s => [s.name, s.value]));
  }, [stems]);

  return (
    <section aria-labelledby={id}>
      <SROnly as='h2' id={id}>
        <Localized id='definition-inflection-heading'/>
      </SROnly>
      {tables.map(table =>
        <Fragment key={table.id}>
          <S.TableContainer>
            <DefinitionTable
              layout={table.inflectionTableLayout.rows}
              caption={table.caption?.inlines}
              term={term}
              stems={stemMap}
              customForms={table.customForms}
            />
          </S.TableContainer>
          <S.TableSource>
            <Localized
              id='definition-table-layout-from'
              vars={{tableName: table.inflectionTable.name}}
              elems={{
                'table-link': <Link to={InflectionTablePage(
                  table.inflectionTable.id,
                  table.inflectionTable.name,
                  parent
                )}/>,
              }}
            >
              <></>
            </Localized>
          </S.TableSource>
        </Fragment>
      )}
    </section>
  );
};

export default Inflection;
