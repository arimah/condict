import React from 'react';
import {Localized} from '@fluent/react';
import LinkArrow from 'mdi-react/ChevronRightIcon';

import {LanguagePage, DefinitionPage} from '../page';
import {DefinitionId} from '../graphql';

import {RichContent, BlockFields} from './rich-text';
import ClampedBodyText from './clamped-body-text';
import {LinkCard} from './card';
import * as S from './styles';

export type Props = {
  definition: DefinitionCardData;
  parent: LanguagePage;
  hideTime?: boolean;
};

export interface DefinitionCardData {
  readonly id: DefinitionId;
  readonly term: string;
  readonly partOfSpeech?: {
    readonly name: string;
  };
  readonly description: readonly BlockFields[];
  readonly timeCreated: number;
  readonly timeUpdated: number;
}

const DefinitionCard = React.memo((props: Props): JSX.Element => {
  const {parent, definition, hideTime = false} = props;
  return (
    <LinkCard
      to={DefinitionPage(definition.id, definition.term, parent)}
      title={<>
        {definition.term}
        {definition.partOfSpeech &&
          <S.CardTitleContext>
            {definition.partOfSpeech.name}
          </S.CardTitleContext>}
      </>}
      iconAfter={<LinkArrow className='rtl-mirror'/>}
    >
      <ClampedBodyText maxLines={5}>
        <RichContent
          value={definition.description}
          heading1='h3'
          heading2='h4'
          // 1 more than maxLines, to guarantee "..." if there's >5 blocks
          maxBlocks={6}
        />
      </ClampedBodyText>
      {!hideTime &&
        <S.Secondary as='p'>
          <Localized
            id={
              definition.timeCreated === definition.timeUpdated
                ? 'definition-added-on'
                : 'definition-edited-on'
            }
            vars={{time: new Date(definition.timeUpdated)}}
          />
        </S.Secondary>}
    </LinkCard>
  );
});

DefinitionCard.displayName = 'DefinitionCard';

export default DefinitionCard;
