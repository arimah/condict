import {Localized} from '@fluent/react';
import LinkArrow from 'mdi-react/ChevronRightIcon';
import AddIcon from 'mdi-react/PlusIcon';

import {Button, ConlangFlag, NonIdealState} from '@condict/ui';

import {LinkCard, RichContent} from '../../ui';
import {OperationResult} from '../../graphql';
import {LanguagePage} from '../../page';

import HomeQuery from './query';
import * as S from './styles';

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
      <S.LanguageList aria-labelledby={ariaLabelledby}>
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
      </S.LanguageList>
    );
  }

  return (
    <S.LanguageList aria-labelledby={ariaLabelledby}>
      {languages.map(lang =>
        <LanguageCard key={lang.id} lang={lang}/>
      )}
      <Button onClick={onAddLanguage}>
        <AddIcon/>
        <span>
          <Localized id='home-add-language-button'/>
        </span>
      </Button>
    </S.LanguageList>
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
    <S.LanguageDesc>
      <RichContent
        value={lang.description}
        heading1='h3'
        heading2='h4'
        stripLinks
        maxBlocks={3} // -webkit-line-clamp: 3
      />
    </S.LanguageDesc>
    <S.SecondaryDetail>
      <Localized id='home-language-statistics' vars={lang.statistics}/>
    </S.SecondaryDetail>
  </LinkCard>;
