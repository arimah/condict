import {Localized} from '@fluent/react';

import {BodyText} from '@condict/ui';

import {LanguagePage, DefinitionPage, InflectionTablePage} from '../../page';
import {Link, PartOfSpeechName} from '../../ui';
import {OperationResult} from '../../graphql';

import LemmaQuery from './query';

export type Props = {
  definitions: DerivedDefinitions;
  langPage: LanguagePage;
};

type DerivedDefinitions = NonNullable<
  OperationResult<typeof LemmaQuery>['lemma']
>['derivedDefinitions'];

// TODO: Fix up this component to look less dull

const DerivedDefinitionList = (props: Props): JSX.Element => {
  const {definitions, langPage} = props;
  return (
    <section>
      <PartOfSpeechName>
        <Localized id='lemma-derived-heading'/>
      </PartOfSpeechName>

      <BodyText>
        <ul>
          {definitions.map((def, i) => {
            const {derivedFrom, inflectedForm} = def;
            const {inflectionTable} = inflectedForm.inflectionTableLayout;
            const tablePage = InflectionTablePage(
              inflectionTable.id,
              inflectionTable.name,
              langPage
            );
            const defPage = DefinitionPage(
              derivedFrom.id,
              derivedFrom.term,
              langPage
            );
            return (
              <li key={i}>
                <Localized
                  id='lemma-derived-from'
                  vars={{
                    formName: inflectedForm.displayName,
                    sourceTerm: derivedFrom.term,
                  }}
                  elems={{
                    'form-link': <Link to={tablePage}/>,
                    'def-link': <Link to={defPage}/>,
                  }}
                >
                  <></>
                </Localized>
              </li>
            );
          })}
        </ul>
      </BodyText>
    </section>
  );
};

export default DerivedDefinitionList;
