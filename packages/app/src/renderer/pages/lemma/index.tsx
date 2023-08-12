import {Localized} from '@fluent/react';

import {SROnly, useUniqueId} from '@condict/ui';

import {LanguagePage, SearchPage} from '../../page';
import {
  FlowContent,
  MainHeader,
  Subheader,
  Selectable,
  TagList,
  Link,
  Divider,
  renderData,
} from '../../ui';
import {LemmaId, LanguageId} from '../../graphql';

import usePageData from '../page-data';
import {PageProps} from '../types';

import DefinitionList from './definitions';
import DerivedDefinitionList from './derived-definitions';
import LemmaQuery from './query';

export type Props = {
  id: LemmaId;
  languageId: LanguageId;
} & PageProps;

const LemmaPage = (props: Props): JSX.Element => {
  const {id, languageId, pageRef} = props;

  const data = usePageData(LemmaQuery, {
    args: {id},
    isEmpty: data => data.lemma === null,
    pageTitle: data => data.lemma?.term,
    shouldReload: event => (
      event.type === 'lemma' && event.id === id ||
      event.type === 'definition' && (
        event.lemmaId === id ||
        event.action === 'update' && event.prevLemmaId === id
      ) ||
      event.type === 'language' && event.id === languageId ||
      (
        event.type === 'partOfSpeech' ||
        event.type === 'inflectionTable'
      ) && event.languageId === languageId
    ),
    pageRef,
  });

  const htmlId = useUniqueId();

  return (
    <FlowContent>
      {renderData(data, ({lemma}) => {
        if (!lemma) {
          return (
            <p>
              <Localized id='lemma-not-found-error'/>
            </p>
          );
        }

        const lang = lemma.language;
        const langPage = LanguagePage(lang.id, lang.name);
        const defCount = lemma.definitions.length;
        return <>
          <MainHeader>
            <Selectable as='h1'>{lemma.term}</Selectable>
          </MainHeader>
          <Subheader>
            <Localized
              id='lemma-subheading'
              vars={{language: lang.name}}
              elems={{'lang-link': <Link to={langPage}/>}}
            >
              <span></span>
            </Localized>
          </Subheader>

          <DefinitionList lemma={lemma} langPage={langPage}/>

          {lemma.derivedDefinitions.length > 0 && <>
            {defCount > 0 && <Divider/>}
            <DerivedDefinitionList
              definitions={lemma.derivedDefinitions}
              langPage={langPage}
            />
          </>}

          {lemma.tags.length > 0 && <>
            <Divider/>
            <section aria-labelledby={`${htmlId}-tags`}>
              <SROnly as='h2' id={`${htmlId}-tags`}>
                <Localized id='lemma-tags-heading'/>
              </SROnly>
              <TagList
                tags={lemma.tags}
                target={t => SearchPage({tag: t.id, language: lang.id})}
              />
            </section>
          </>}
        </>;
      })}
    </FlowContent>
  );
};

export default LemmaPage;
