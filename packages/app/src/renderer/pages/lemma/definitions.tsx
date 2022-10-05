import {Fragment, useCallback} from 'react';
import {Localized} from '@fluent/react';
import ChevronRightIcon from 'mdi-react/ChevronRightIcon';

import {Button, SROnly, useUniqueId} from '@condict/ui';

import {LanguagePage, LemmaPage, DefinitionPage} from '../../page';
import {useNavigateTo, useOpenPanel} from '../../navigation';
import {Selectable, RichContent, Divider, PartOfSpeechName} from '../../ui';
import {DefinitionId, OperationResult} from '../../graphql';
import {editDefinitionPanel} from '../../panels';

import LemmaQuery from './query';
import * as S from './styles';

export type Props = {
  lemma: Lemma;
  langPage: LanguagePage;
};

type Lemma = NonNullable<OperationResult<typeof LemmaQuery>['lemma']>;

const DefinitionList = (props: Props): JSX.Element => {
  const {langPage, lemma} = props;

  const navigateTo = useNavigateTo();

  const openPanel = useOpenPanel();
  const handleEdit = useCallback((defId: DefinitionId) => {
    void openPanel(editDefinitionPanel(defId)).then(def => {
      if (def && def.lemma.id !== lemma.id) {
        // If the definition has moved to a different lemma, we must navigate
        // to the new lemma. If there are no other definitions in the original
        // lemma, we replace the current page, as the original lemma no longer
        // exists. Otherwise, we open the new lemma in a new tab.
        const wasOnlyDefinition =
          !lemma.definitions.some(d => d.id !== defId) &&
          lemma.derivedDefinitions.length === 0;
        navigateTo(LemmaPage(def.lemma.id, def.term, langPage), {
          replace: wasOnlyDefinition,
          openInNewTab: !wasOnlyDefinition,
        });
      }
    });
  }, [lemma, langPage]);

  const {term, definitions} = lemma;

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
            <Button slim onClick={() => handleEdit(def.id)}>
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
