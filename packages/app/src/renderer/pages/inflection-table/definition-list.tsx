import {ReactNode} from 'react';
import {Localized} from '@fluent/react';
import LinkArrow from 'mdi-react/ChevronRightIcon';
import OldTableVersionIcon from 'mdi-react/TableAlertIcon';

import {InflectionTablePage} from '../../page';
import {CardList, LinkCard, DefinitionCard} from '../../ui';
import {OperationResult} from '../../graphql';

import InflectionTableQuery from './query';
import * as S from './styles';

export type Props = {
  usedBy: UsedByDefinitions;
  oldUsedBy: OlderUsedByDefinitions;
  oldLayoutCount: number;
  parent: InflectionTablePage;
};

type UsedByDefinitions = NonNullable<
  OperationResult<typeof InflectionTableQuery>['inflectionTable']
>['usedBy'];

type OlderUsedByDefinitions = NonNullable<
  OperationResult<typeof InflectionTableQuery>['inflectionTable']
>['oldUsedBy'];

const DefinitionList = (props: Props): JSX.Element => {
  const {usedBy, oldUsedBy, oldLayoutCount, parent} = props;

  const {totalCount, hasNext} = usedBy.page;
  const {totalCount: totalCountOld, hasNext: hasNextOld} = oldUsedBy.page;

  return (
    <section>
      <h2>
        <Localized id='inflection-table-used-by-heading'/>
      </h2>

      {totalCount > 0 ? (
        <CardList>
          {usedBy.nodes.map(({definition: def, hasOldLayouts}) =>
            <DefinitionCard
              key={def.id}
              definition={def}
              parent={parent.language}
              wrapTitle={wrapTitle}
            >
              {hasOldLayouts &&
                <S.OldVersionNotice>
                  <OldTableVersionIcon/>
                  <span>
                    <Localized
                      id='inflection-table-definition-has-older-layout'
                    />
                  </span>
                </S.OldVersionNotice>}
            </DefinitionCard>
          )}
          {hasNext && (
            <LinkCard
              // TODO: Proper target for this link
              to={parent}
              title={
                <Localized
                  id='inflection-table-browse-definitions-title'
                  vars={{definitionCount: totalCount}}
                />
              }
              iconAfter={<LinkArrow className='rtl-mirror'/>}
            />
          )}
        </CardList>
      ) : (
        <p>
          <Localized id='inflection-table-not-used-description'/>
        </p>
      )}

      {totalCountOld > 0 && <>
        <h3>
          <Localized id='inflection-table-older-layouts-heading'/>
        </h3>
        <p>
          <Localized
            id='inflection-table-older-layouts'
            vars={{
              definitionCount: totalCountOld,
              layoutCount: oldLayoutCount,
            }}
          />
        </p>

        <CardList>
          {oldUsedBy.nodes.map(({definition: def}) =>
            <DefinitionCard
              key={def.id}
              definition={def}
              parent={parent.language}
              wrapTitle={wrapTitleOld}
            />
          )}
        </CardList>
      </>}
    </section>
  );
};

export default DefinitionList;

const wrapTitle = (title: ReactNode) => <h3>{title}</h3>;

const wrapTitleOld = (title: ReactNode) => <h4>{title}</h4>;
