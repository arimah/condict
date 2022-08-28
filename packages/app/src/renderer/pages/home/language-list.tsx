import {Localized} from '@fluent/react';
import LinkArrow from 'mdi-react/ChevronRightIcon';
import AddIcon from 'mdi-react/PlusIcon';

import {Button} from '@condict/ui';

import {
  CardList,
  LinkCard,
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

  // This component is only rendered when there's at least one language.

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
    title={<h2>{lang.name}</h2>}
    iconAfter={<LinkArrow className='rtl-mirror'/>}
  >
    {hasRichContent(lang.description) &&
      <RichContent
        value={lang.description}
        heading1='h3'
        heading2='h4'
        stripLinks
        maxLines={3}
      />
    }
    <Secondary as='p'>
      <Localized id='home-language-statistics' vars={lang.statistics}/>
    </Secondary>
  </LinkCard>;
