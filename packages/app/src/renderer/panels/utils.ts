import {BlockElement, CustomText} from '@condict/rich-text-editor';

export const hasTableCaption = (caption: BlockElement[]): boolean =>
  caption[0].children.some(c => !!(c as CustomText).text);
