import {Localized} from '@fluent/react';
import AddIcon from 'mdi-react/PlusIcon';

import {Button, BodyText} from '@condict/ui';

import {InflectionTablePage, LanguagePage} from '../../page';
import {LinkCard, FullRow, Secondary, ResourceTime} from '../../ui';
import {OperationResult} from '../../graphql';

import PartOfSpeechQuery from './query';
import * as S from './styles';

export type Props = {
  'aria-labelledby': string;
  language: LanguagePage;
  tables: InflectionTables;
  onAddTable: () => void;
};

type InflectionTables = NonNullable<
  OperationResult<typeof PartOfSpeechQuery>['partOfSpeech']
>['inflectionTables'];

const InflectionTableList = (props: Props): JSX.Element => {
  const {
    'aria-labelledby': ariaLabelledby,
    language,
    tables,
    onAddTable,
  } = props;
  return (
    <section aria-labelledby={ariaLabelledby}>
      {tables.length > 0 ? (
        <S.InflectionTableList>
          {tables.map(table =>
            <LinkCard
              key={table.id}
              to={InflectionTablePage(table.id, table.name, language)}
              title={table.name}
            >
              <p>
                <Localized
                  id='part-of-speech-table-used-by-definitions'
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
            <Button bold onClick={onAddTable}>
              <AddIcon/>
              <span>
                <Localized id='part-of-speech-add-table-button'/>
              </span>
            </Button>
          </FullRow>
        </S.InflectionTableList>
      ) : <>
        <BodyText as='p'>
          <Localized id='part-of-speech-no-tables-description'/>
        </BodyText>
        <p>
          <Button bold intent='accent' onClick={onAddTable}>
            <AddIcon/>
            <span>
              <Localized id='part-of-speech-add-table-button'/>
            </span>
          </Button>
        </p>
      </>}
    </section>
  );
};

export default InflectionTableList;
