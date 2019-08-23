import {
  BlockKind,
  InlineKind,
  DefinitionId,
  LanguageId,
  LemmaId,
  PartOfSpeechId,
} from '../graphql/types';

export type BlockElementJson = {
  kind: BlockKind;
  level?: number;
  text: string;
  inlines?: InlineElementJson[];
};

export type InlineElementJson = StyleInlineJson | LinkInlineJson;

export type StyleInlineJson = {
  kind: Exclude<InlineKind, InlineKind.LINK>;
  start: number;
  end: number;
};

export type LinkInlineJson = {
  kind: InlineKind.LINK;
  start: number;
  end: number;
  linkTarget: string;
};

export type TableCaptionJson = {
  text: string;
  inlines?: InlineElementJson[];
};

export const enum CondictLinkType {
  LANGUAGE = 'language',
  LEMMA = 'lemma',
  DEFINITION = 'definition',
  PART_OF_SPEECH = 'part-of-speech',
}

export type CondictLink =
  | LanguageLink
  | LemmaLink
  | DefinitionLink
  | PartOfSpeechLink;

export type LanguageLink = {
  type: CondictLinkType.LANGUAGE;
  id: LanguageId;
};

export type LemmaLink = {
  type: CondictLinkType.LEMMA;
  id: LemmaId;
};

export type DefinitionLink = {
  type: CondictLinkType.DEFINITION;
  id: DefinitionId;
};

export type PartOfSpeechLink = {
  type: CondictLinkType.PART_OF_SPEECH;
  id: PartOfSpeechId;
};
