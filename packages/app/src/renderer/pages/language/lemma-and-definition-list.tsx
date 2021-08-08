import {Localized} from '@fluent/react';
import LinkArrow from 'mdi-react/ChevronRightIcon';
import PencilIcon from 'mdi-react/PencilIcon';

import {Button, BodyText, SROnly} from '@condict/ui';

import {LanguagePage, DefinitionPage} from '../../page';
import {
  CardList,
  LinkCard,
  Secondary,
  ClampedBodyText,
  RichContent,
} from '../../ui';
import {OperationResult} from '../../graphql';

import LanguageQuery from './query';
import * as S from './styles';

export type Props = {
  parent: LanguagePage;
  lemmaCount: number;
  firstWord: string | null | undefined;
  lastWord: string | null | undefined;
  recentDefinitions: RecentDefinitions;
  htmlId: string;
  onAddDefinition: () => void;
};

type Language = NonNullable<OperationResult<typeof LanguageQuery>['language']>;

type RecentDefinitions = Language['recentDefinitions']['nodes'];

const LemmaAndDefinitionList = (props: Props): JSX.Element => {
  const {
    parent,
    lemmaCount,
    firstWord,
    lastWord,
    recentDefinitions,
    htmlId,
    onAddDefinition,
  } = props;

  if (lemmaCount === 0) {
    return (
      <section aria-labelledby={`${htmlId}-lemmas-title`}>
        <SROnly as='h2' id={`${htmlId}-lemmas-title`}>
          <Localized id='language-words-in-language-heading'/>
        </SROnly>

        <S.NoLemmas
          title={<Localized id='language-no-words-heading'/>}
          headingLevel={2}
          description={<Localized id='language-no-words-description'/>}
          action={
            <Button bold intent='accent' onClick={onAddDefinition}>
              <PencilIcon/>
              <span>
                <Localized id='language-define-word-button'/>
              </span>
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section aria-labelledby={`${htmlId}-lemmas-title`}>
      <SROnly as='h2' id={`${htmlId}-lemmas-title`}>
        <Localized id='language-words-in-language-heading'/>
      </SROnly>

      <LinkCard
        to={parent}
        title={
          <Localized id='language-browse-lemmas-title' vars={{lemmaCount}}/>
        }
        iconAfter={<LinkArrow className='rtl-mirror'/>}
      >
        <BodyText as='p'>
          <Localized
            id='language-browse-lemmas-description'
            vars={{firstWord: firstWord ?? '', lastWord: lastWord ?? ''}}
            elems={{term: <i/>}}
          >
            <></>
          </Localized>
        </BodyText>
      </LinkCard>

      <p>
        <Button bold onClick={onAddDefinition}>
          <PencilIcon/>
          <span>
            <Localized id='language-define-word-button'/>
          </span>
        </Button>
      </p>

      {recentDefinitions.length > 0 && <>
        <h3 id={`${htmlId}-recent-title`}>
          <Localized id='language-recent-definitions-heading'/>
        </h3>
        <CardList as='section' aria-labelledby={`${htmlId}-recent-title`}>
          {recentDefinitions.map(definition =>
            <RecentDefinitionCard
              key={definition.id}
              parent={parent}
              definition={definition}
            />
          )}
        </CardList>
      </>}
    </section>
  );
};

export default LemmaAndDefinitionList;

type RecentDefinitionCardProps = {
  parent: LanguagePage;
  definition: RecentDefinition;
};

type RecentDefinition = RecentDefinitions extends (infer T)[] ? T : never;

const RecentDefinitionCard = (
  props: RecentDefinitionCardProps
): JSX.Element => {
  const {parent, definition} = props;
  return (
    <LinkCard
      to={DefinitionPage(definition.id, definition.term, parent)}
      title={<>
        {definition.term}
        <S.PartOfSpeechName>
          {definition.partOfSpeech.name}
        </S.PartOfSpeechName>
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
      <Secondary as='p'>
        <Localized
          id={
            definition.timeCreated === definition.timeUpdated
              ? 'definition-added-on'
              : 'definition-edited-on'
          }
          vars={{time: new Date(definition.timeUpdated)}}
        />
      </Secondary>
    </LinkCard>
  );
};
