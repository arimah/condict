import {Localized} from '@fluent/react';
import LinkArrow from 'mdi-react/ChevronRightIcon';

import {PartOfSpeechPage} from '../../page';
import {CardList, LinkCard, DefinitionCard} from '../../ui';
import {OperationResult} from '../../graphql';

import PartOfSpeechQuery from './query';

export type Props = {
  'aria-labelledby': string;
  definitions: Definitions;
  totalCount: number;
  parent: PartOfSpeechPage;
};

type Definitions = NonNullable<
  OperationResult<typeof PartOfSpeechQuery>['partOfSpeech']
>['usedByDefinitions']['nodes'];

const DefinitionList = (props: Props): JSX.Element => {
  const {
    'aria-labelledby': ariaLabelledby,
    definitions,
    totalCount,
    parent,
  } = props;

  return (
    <section aria-labelledby={ariaLabelledby}>
      {definitions.length > 0 ? (
        <CardList>
          {definitions.map(def =>
            <DefinitionCard
              key={def.id}
              definition={def}
              parent={parent.language}
              hideTime
            />
          )}
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
        </CardList>
      ) : (
        <p>
          <Localized id='part-of-speech-no-definitions-description'/>
        </p>
      )}
    </section>
  );
};

export default DefinitionList;
