import {Localized} from '@fluent/react';
import LinkArrow from 'mdi-react/ChevronRightIcon';
import PencilIcon from 'mdi-react/PencilIcon';

import {Button, BodyText, SROnly} from '@condict/ui';

import {LanguagePage} from '../../page';
import {CardList, LinkCard, DefinitionCard} from '../../ui';
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
            <Button intent='accent' onClick={onAddDefinition}>
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
          <h3>
            <Localized id='language-browse-lemmas-title' vars={{lemmaCount}}/>
          </h3>
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
        <Button intent='bold' onClick={onAddDefinition}>
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
          {recentDefinitions.map(def =>
            <DefinitionCard
              key={def.id}
              parent={parent}
              definition={def}
              wrapTitle={title => <h4>{title}</h4>}
              time='latest'
            />
          )}
        </CardList>
      </>}
    </section>
  );
};

export default LemmaAndDefinitionList;
