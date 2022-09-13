import {Fragment} from 'react';
import {Localized} from '@fluent/react';
import ChevronRightIcon from 'mdi-react/ChevronRightIcon';

import {Button, SROnly, useUniqueId} from '@condict/ui';

import {DefinitionPage, LanguagePage} from '../../page';
import {Selectable, RichContent, Divider, PartOfSpeechName} from '../../ui';
import {DefinitionId, OperationResult} from '../../graphql';

import LemmaQuery from './query';
import * as S from './styles';

export type Props = {
  term: string;
  langPage: LanguagePage;
  definitions: Definitions;
  onEdit: (id: DefinitionId) => void;
};

type Definitions = NonNullable<
  OperationResult<typeof LemmaQuery>['lemma']
>['definitions'];

const DefinitionList = (props: Props): JSX.Element => {
  const {term, langPage, definitions, onEdit} = props;

  const htmlId = useUniqueId();

  return <>
    {definitions.map((def, i) =>
      <Fragment key={def.id}>
        {i > 0 && <Divider/>}
        <section aria-labelledby={`${htmlId}-def${i}`}>
          <SROnly as='h2' id={`${htmlId}-def${i}`}>
            <Localized id='lemma-definition-n' vars={{n: i + 1}}/>
          </SROnly>

          <S.DefinitionTools>
            <Button slim onClick={() => onEdit(def.id)}>
              <Localized id='generic-edit-button'/>
            </Button>
          </S.DefinitionTools>

          <Selectable>
            <PartOfSpeechName>
              {def.partOfSpeech.name}
            </PartOfSpeechName>
            <RichContent
              value={def.description}
              heading1='h3'
              heading2='h4'
            />
          </Selectable>

          <p>
            <S.DefinitionLink to={DefinitionPage(def.id, term, langPage)}>
              <Localized id='lemma-definition-link'/>
              <ChevronRightIcon/>
            </S.DefinitionLink>
          </p>
        </section>
      </Fragment>
    )}
  </>;
};

export default DefinitionList;
