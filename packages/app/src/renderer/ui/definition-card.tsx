import React, {ReactNode} from 'react';
import LinkArrow from 'mdi-react/ChevronRightIcon';

import {LanguagePage, DefinitionPage} from '../page';
import {DefinitionId} from '../graphql';

import {RichContent, BlockFields} from './rich-text';
import ResourceTime from './resource-time';
import {LinkCard} from './card';
import * as S from './styles';

export type Props = {
  definition: DefinitionCardData;
  parent: LanguagePage;
  time?: 'latest' | 'created' | 'updated' | null;
  wrapTitle?: (title: JSX.Element) => ReactNode;
  children?: ReactNode;
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

const defaultWrapTitle = (title: JSX.Element) => title;

const DefinitionCard = React.memo((props: Props): JSX.Element => {
  const {
    parent,
    definition,
    time = null,
    wrapTitle = defaultWrapTitle,
    children,
  } = props;
  return (
    <LinkCard
      to={DefinitionPage(definition.id, definition.term, parent)}
      title={
        wrapTitle(<>
          {definition.term}
          {definition.partOfSpeech &&
            <S.CardTitleContext>
              {' '}
              {definition.partOfSpeech.name}
            </S.CardTitleContext>
          }
        </>)
      }
      iconAfter={<LinkArrow className='rtl-mirror'/>}
    >
      <RichContent
        value={definition.description}
        heading1='h3'
        heading2='h4'
        stripLinks
        maxLines={5}
      />
      {time !== null &&
        <S.Secondary as='p'>
          <ResourceTime
            of={definition}
            time={time}
            createdLabelId='definition-added-on'
            updatedLabelId='definition-edited-on'
          />
        </S.Secondary>}
      {children}
    </LinkCard>
  );
});

DefinitionCard.displayName = 'DefinitionCard';

export default DefinitionCard;
