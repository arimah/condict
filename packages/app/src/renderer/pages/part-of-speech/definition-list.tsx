import {ReactNode} from 'react';
import {Localized} from '@fluent/react';
import LinkArrow from 'mdi-react/ChevronRightIcon';

import {BodyText} from '@condict/ui';

import {PartOfSpeechPage} from '../../page';
import {CardList, LinkCard, DefinitionCard} from '../../ui';
import {OperationResult} from '../../graphql';

import PartOfSpeechQuery from './query';

export type Props = {
  definitions: Definitions;
  parent: PartOfSpeechPage;
};

type Definitions = NonNullable<
  OperationResult<typeof PartOfSpeechQuery>['partOfSpeech']
>['usedByDefinitions'];

const DefinitionList = (props: Props): JSX.Element => {
  const {
    definitions,
    parent,
  } = props;

  const {totalCount, hasNext} = definitions.page;

  return (
    <section>
      <h2>
        <Localized id='part-of-speech-definitions-heading'/>
      </h2>

      {totalCount > 0 ? (
        <CardList>
          {definitions.nodes.map(def =>
            <DefinitionCard
              key={def.id}
              definition={def}
              parent={parent.language}
              wrapTitle={wrapTitle}
            />
          )}
          {hasNext && (
            <LinkCard
              // TODO: Proper target for this link
              to={parent}
              title={
                <Localized
                  id='part-of-speech-browse-definitions-title'
                  vars={{definitionCount: totalCount}}
                />
              }
              iconAfter={<LinkArrow className='rtl-mirror'/>}
            />
          )}
        </CardList>
      ) : (
        <BodyText as='p'>
          <Localized id='part-of-speech-no-definitions-description'/>
        </BodyText>
      )}
    </section>
  );
};

export default DefinitionList;

const wrapTitle = (title: ReactNode) => <h3>{title}</h3>;
