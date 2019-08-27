import {
  BlockElementJson,
  InlineElementJson,
  LinkInlineJson,
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
  InlineKind,
  LinkInline as LinkInlineType,
  InternalLinkTarget as InternalLinkTargetType,
  LanguageLinkTarget as LanguageLinkTargetType,
  LemmaLinkTarget as LemmaLinkTargetType,
  DefinitionLinkTarget as DefinitionLinkTargetType,
  PartOfSpeechLinkTarget as PartOfSpeechLinkTargetType,
} from '../types';

import {ResolversFor} from './types';

const BlockElement: ResolversFor<BlockElementType, BlockElementJson> = {
  // Level 0 is not usually stored in the object, to save space.
  level: p => p.level || 0,
};

const InlineElement: ResolversFor<InlineElementType, InlineElementJson> = {
  __resolveType(p) {
    switch (p.kind) {
      case InlineKind.BOLD:
      case InlineKind.ITALIC:
      case InlineKind.UNDERLINE:
      case InlineKind.STRIKETHROUGH:
      case InlineKind.SUPERSCRIPT:
      case InlineKind.SUBSCRIPT:
        return 'StyleInline';
      case InlineKind.LINK:
        return 'LinkInline';
    }
  },
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
  language: (p, _args, {model: {Language}}) =>
    Language.byId(p.id),
};

const LemmaLinkTarget: ResolversFor<LemmaLinkTargetType, LemmaLink> = {
  lemma: (p, _args, {model: {Lemma}}) =>
    Lemma.byId(p.id),
};

const DefinitionLinkTarget: ResolversFor<
  DefinitionLinkTargetType,
  DefinitionLink
> = {
  definition: (p, _args, {model: {Definition}}) =>
    Definition.byId(p.id),
};

const PartOfSpeechLinkTarget: ResolversFor<
  PartOfSpeechLinkTargetType,
  PartOfSpeechLink
> = {
  partOfSpeech: (p, _args, {model: {PartOfSpeech}}) =>
    PartOfSpeech.byId(p.id),
};

export default {
  BlockElement,
  InlineElement,
  LinkInline,
  InternalLinkTarget,
  LanguageLinkTarget,
  LemmaLinkTarget,
  DefinitionLinkTarget,
  PartOfSpeechLinkTarget,
};
