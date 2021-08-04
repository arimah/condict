import {Localized} from '@fluent/react';
import LinkArrow from 'mdi-react/ChevronRightIcon';
import AddIcon from 'mdi-react/PlusIcon';

import {Button, ConlangFlag, NonIdealState} from '@condict/ui';

import {
  CardList,
  LinkCard,
  ClampedBodyText,
  RichContent,
  Secondary,
  hasRichContent,
} from '../../ui';
import {OperationResult} from '../../graphql';
import {LanguagePage} from '../../page';

import HomeQuery from './query';

export type Props = {
  'aria-labelledby': string;
  languages: Languages;
  onAddLanguage: () => void;
};

type Languages = OperationResult<typeof HomeQuery>['languages'];

type Language = Languages extends (infer T)[] ? T : never;

const LanguageList = (props: Props): JSX.Element => {
  const {'aria-labelledby': ariaLabelledby, languages, onAddLanguage} = props;

  if (languages.length === 0) {
    return (
      <CardList as='section' aria-labelledby={ariaLabelledby}>
        <NonIdealState
          minimal
          image={<ConlangFlag width={188} height={116}/>}
          title={<Localized id='home-no-languages-heading'/>}
          description={<Localized id='home-no-languages-description'/>}
          action={
            <Button bold intent='accent' onClick={onAddLanguage}>
              <AddIcon/>
              <span>
                <Localized id='home-add-language-button'/>
              </span>
            </Button>
          }
        />
      </CardList>
    );
  }

  return (
    <CardList as='section' aria-labelledby={ariaLabelledby}>
      {languages.map(lang =>
        <LanguageCard key={lang.id} lang={lang}/>
      )}
      <Button onClick={onAddLanguage}>
        <AddIcon/>
        <span>
          <Localized id='home-add-language-button'/>
        </span>
      </Button>
    </CardList>
  );
};

export default LanguageList;

type LanguageCardProps = {
  lang: Language;
};

const LanguageCard = ({lang}: LanguageCardProps): JSX.Element =>
  <LinkCard
    key={lang.id}
    to={LanguagePage(lang.id, lang.name)}
    title={lang.name}
    iconAfter={<LinkArrow className='rtl-mirror'/>}
  >
    {hasRichContent(lang.description) &&
      <ClampedBodyText maxLines={3}>
        <RichContent
          value={lang.description}
          heading1='h3'
          heading2='h4'
          stripLinks
          // 1 more than maxLines, to guarantee "..." if there's >3 blocks
          maxBlocks={4}
        />
      </ClampedBodyText>
    }
    <Secondary as='p'>
      <Localized id='home-language-statistics' vars={lang.statistics}/>
    </Secondary>
  </LinkCard>;
