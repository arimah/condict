import React, {ReactNode} from 'react';
import {useLocalization} from '@fluent/react';

import {
  Page,
  LanguagePage,
  LemmaPage,
  DefinitionPage,
  PartOfSpeechPage,
} from '../../page';

import Link from '../link';
import BrokenLink from '../broken-link';

import {InternalLinkTargetFields} from './types';

export interface Props {
  target: InternalLinkTargetFields;
  children: ReactNode;
}

const InternalLink = React.memo((props: Props) => {
  const {target, children} = props;

  const {l10n} = useLocalization();

  let page: Page | null = null;
  let title: string | undefined;
  switch (target.__typename) {
    case 'LanguageLinkTarget': {
      const {language} = target;
      if (language) {
        page = LanguagePage(language.id, language.name);
        title = l10n.getString('link-language-tooltip', {name: language.name});
      }
      break;
    }
    case 'LemmaLinkTarget': {
      const {lemma} = target;
      if (lemma) {
        page = LemmaPage(
          lemma.id,
          lemma.term,
          LanguagePage(lemma.language.id, lemma.language.name)
        );
        title = l10n.getString('link-lemma-tooltip', {
          term: lemma.term,
          language: lemma.language.name,
        });
      }
      break;
    }
    case 'DefinitionLinkTarget': {
      const {definition} = target;
      if (definition) {
        page = DefinitionPage(
          definition.id,
          definition.term,
          LanguagePage(definition.language.id, definition.language.name)
        );
        title = l10n.getString('link-definition-tooltip', {
          term: definition.term,
          language: definition.language.name,
        });
      }
      break;
    }
    case 'PartOfSpeechLinkTarget': {
      const {partOfSpeech} = target;
      if (partOfSpeech) {
        page = PartOfSpeechPage(
          partOfSpeech.id,
          partOfSpeech.name,
          LanguagePage(partOfSpeech.language.id, partOfSpeech.language.name)
        );
        title = l10n.getString('link-part-of-speech-tooltip', {
          name: partOfSpeech.name,
          language: partOfSpeech.language.name,
        });
      }
      break;
    }
  }

  if (!page) {
    return (
      <BrokenLink href='condict://broken-link'>
        {children}
      </BrokenLink>
    );
  }

  return <Link to={page} title={title}>{children}</Link>;
});

InternalLink.displayName = 'InternalLink';

export default InternalLink;
