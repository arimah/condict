import {Localized} from '@fluent/react';
import AddIcon from 'mdi-react/PlusIcon';

import {Button, BodyText} from '@condict/ui';

import {PartOfSpeechPage, LanguagePage} from '../../page';
import {LinkCard, FullRow, Secondary} from '../../ui';
import {OperationResult} from '../../graphql';

import LanguageQuery from './query';
import * as S from './styles';

export type Props = {
  'aria-labelledby': string;
  parent: LanguagePage;
  partsOfSpeech: PartsOfSpeech;
  onAddPartOfSpeech: () => void;
};

type PartsOfSpeech = NonNullable<
  OperationResult<typeof LanguageQuery>['language']
>['partsOfSpeech'];

const PartOfSpeechList = (props: Props): JSX.Element => {
  const {
    'aria-labelledby': ariaLabelledby,
    parent,
    partsOfSpeech,
    onAddPartOfSpeech,
  } = props;
  return (
    <section aria-labelledby={ariaLabelledby}>
      {partsOfSpeech.length > 0 ? (
        <S.PartOfSpeechList>
          {partsOfSpeech.map(pos =>
            <LinkCard
              key={pos.id}
              to={PartOfSpeechPage(pos.id, pos.name, parent)}
              title={pos.name}
            >
              <p>
                <Localized
                  id='language-part-of-speech-tables'
                  vars={{tableCount: pos.statistics.inflectionTableCount}}
                />
              </p>
              <p>
                <Localized
                  id='language-part-of-speech-used-by-definitions'
                  vars={{definitionCount: pos.statistics.definitionCount}}
                />
              </p>
              <Secondary as='p'>
                <Localized
                  id={
                    pos.timeCreated === pos.timeUpdated
                      ? 'part-of-speech-added-on'
                      : 'part-of-speech-edited-on'
                  }
                  vars={{time: new Date(pos.timeUpdated)}}
                />
              </Secondary>
            </LinkCard>
          )}
          <FullRow>
            <Button onClick={onAddPartOfSpeech}>
              <AddIcon/>
              <span>
                <Localized id='language-add-part-of-speech-button'/>
              </span>
            </Button>
          </FullRow>
        </S.PartOfSpeechList>
      ) : <>
        <BodyText as='p'>
          <Localized id='language-no-parts-of-speech-description'/>
        </BodyText>
        <p>
          <Button bold onClick={onAddPartOfSpeech}>
            <AddIcon/>
            <span>
              <Localized id='language-add-part-of-speech-button'/>
            </span>
          </Button>
        </p>
      </>}
    </section>
  );
};

export default PartOfSpeechList;
