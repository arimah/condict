import {Localized} from '@fluent/react';
import AddIcon from 'mdi-react/PlusIcon';

import {Button, BodyText} from '@condict/ui';

import {InflectionTablePage, LanguagePage} from '../../page';
import {LinkCard, FullRow, Secondary, ResourceTime} from '../../ui';
import {OperationResult} from '../../graphql';

import LanguageQuery from './query';
import * as S from './styles';

export type Props = {
  parent: LanguagePage;
  tables: InflectionTables;
  onAddTable: () => void;
};

type InflectionTables = NonNullable<
  OperationResult<typeof LanguageQuery>['language']
>['inflectionTables'];

const InflectionTableList = (props: Props): JSX.Element => {
  const {parent, tables, onAddTable} = props;
  return (
    <section>
      <h2>
        <Localized id='language-tables-heading'/>
      </h2>

      {tables.length > 0 ? (
        <S.InflectionTableList>
          {tables.map(table =>
            <LinkCard
              key={table.id}
              to={InflectionTablePage(table.id, table.name, parent)}
              title={table.name}
            >
              <p>
                <Localized
                  id='language-table-used-by-definitions'
                  vars={{
                    definitionCount: table.usedByDefinitions.page.totalCount,
                  }}
                />
              </p>
              <Secondary as='p'>
                <ResourceTime
                  of={table}
                  createdLabelId='inflection-table-added-on'
                  updatedLabelId='inflection-table-edited-on'
                />
              </Secondary>
            </LinkCard>
          )}
          <FullRow>
            <Button onClick={onAddTable}>
              <AddIcon/>
              <span>
                <Localized id='language-add-table-button'/>
              </span>
            </Button>
          </FullRow>
        </S.InflectionTableList>
      ) : <>
        <BodyText as='p'>
          <Localized id='language-no-tables-description'/>
        </BodyText>
        <p>
          <Button intent='bold' onClick={onAddTable}>
            <AddIcon/>
            <span>
              <Localized id='language-add-table-button'/>
            </span>
          </Button>
        </p>
      </>}
    </section>
  );
};

export default InflectionTableList;
