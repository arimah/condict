import {
  BlockKind,
  DefinitionId,
  LanguageId,
  LemmaId,
  PartOfSpeechId,
} from '../graphql/types';

export type BlockElementJson = {
  kind: BlockKind;
  level?: number;
  inlines: InlineElementJson[];
};

export const BlockElementJson = {
  isEmpty(block: BlockElementJson): boolean {
    return block.inlines.every(InlineElementJson.isEmpty);
  },
};

export type InlineElementJson = FormattedTextJson | LinkInlineJson;

export const InlineElementJson = {
  isLink(inline: InlineElementJson): inline is LinkInlineJson {
    return typeof (inline as any).linkTarget === 'string';
  },

  isEmpty(inline: InlineElementJson): boolean {
    return (
      InlineElementJson.isLink(inline)
        ? LinkInlineJson.isEmpty(inline)
        : FormattedTextJson.isEmpty(inline)
    );
  },
};

export type FormattedTextJson = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  subscript?: boolean;
  superscript?: boolean;
};

export const FormattedTextJson = {
  isEmpty(text: FormattedTextJson): boolean {
    return text.text === '';
  },
};

export type LinkInlineJson = {
  linkTarget: string;
  inlines: FormattedTextJson[];
};

export const LinkInlineJson = {
  isEmpty(link: LinkInlineJson): boolean {
    return (
      link.inlines.length === 0 ||
      link.inlines.every(FormattedTextJson.isEmpty)
    );
  },
};

export type TableCaptionJson = {
  inlines: FormattedTextJson[];
};

export const TableCaptionJson = {
  isEmpty(caption: TableCaptionJson): boolean {
    return (
      caption.inlines.length === 0 ||
      caption.inlines.every(FormattedTextJson.isEmpty)
    );
  },
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
