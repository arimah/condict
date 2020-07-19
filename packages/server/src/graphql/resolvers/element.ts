import {Language, Lemma, Definition, PartOfSpeech} from '../../model';
import {
  BlockElementJson,
  InlineElementJson,
  LinkInlineJson,
  FormattedTextJson,
  CondictLink,
  CondictLinkType,
  LanguageLink,
  LemmaLink,
  DefinitionLink,
  PartOfSpeechLink,
} from '../../rich-text/types';
import {
  isCondictLink,
  parseCondictLink,
} from '../../rich-text/condict-link';

import {
  BlockElement as BlockElementType,
  InlineElement as InlineElementType,
  FormattedText as FormattedTextType,
  LinkInline as LinkInlineType,
  InternalLinkTarget as InternalLinkTargetType,
  LanguageLinkTarget as LanguageLinkTargetType,
  LemmaLinkTarget as LemmaLinkTargetType,
  DefinitionLinkTarget as DefinitionLinkTargetType,
  PartOfSpeechLinkTarget as PartOfSpeechLinkTargetType,
} from '../types';

import {ResolversFor} from './types';

const BlockElement: ResolversFor<BlockElementType, BlockElementJson> = {
  // Level 0 is not stored in the object, to save space.
  level: p => p.level || 0,
};

const InlineElement: ResolversFor<InlineElementType, InlineElementJson> = {
  __resolveType(p) {
    if (InlineElementJson.isLink(p)) {
      return 'LinkInline';
    }
    return 'FormattedText';
  },
};

const FormattedText: ResolversFor<FormattedTextType, FormattedTextJson> = {
  // Formatting properties are not stored in the object, to save space.
  bold: p => p.bold || false,
  italic: p => p.italic || false,
  underline: p => p.underline || false,
  strikethrough: p => p.strikethrough || false,
  subscript: p => p.subscript || false,
  superscript: p => p.superscript || false,
};

const LinkInline: ResolversFor<LinkInlineType, LinkInlineJson> = {
  internalLinkTarget: p =>
    isCondictLink(p.linkTarget) ? parseCondictLink(p.linkTarget) : null,
};

const InternalLinkTarget: ResolversFor<InternalLinkTargetType, CondictLink> = {
  __resolveType(p) {
    switch (p.type) {
      case CondictLinkType.LANGUAGE:
        return 'LanguageLinkTarget';
      case CondictLinkType.LEMMA:
        return 'LemmaLinkTarget';
      case CondictLinkType.DEFINITION:
        return 'DefinitionLinkTarget';
      case CondictLinkType.PART_OF_SPEECH:
        return 'PartOfSpeechLinkTarget';
    }
  },
};

const LanguageLinkTarget: ResolversFor<LanguageLinkTargetType, LanguageLink> = {
  language: (p, _args, {db}) =>
    Language.byId(db, p.id),
};

const LemmaLinkTarget: ResolversFor<LemmaLinkTargetType, LemmaLink> = {
  lemma: (p, _args, {db}) =>
    Lemma.byId(db, p.id),
};

const DefinitionLinkTarget: ResolversFor<
  DefinitionLinkTargetType,
  DefinitionLink
> = {
  definition: (p, _args, {db}) =>
    Definition.byId(db, p.id),
};

const PartOfSpeechLinkTarget: ResolversFor<
  PartOfSpeechLinkTargetType,
  PartOfSpeechLink
> = {
  partOfSpeech: (p, _args, {db}) =>
    PartOfSpeech.byId(db, p.id),
};

export default {
  BlockElement,
  InlineElement,
  FormattedText,
  LinkInline,
  InternalLinkTarget,
  LanguageLinkTarget,
  LemmaLinkTarget,
  DefinitionLinkTarget,
  PartOfSpeechLinkTarget,
};
