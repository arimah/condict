import {Element} from 'slate';

import {BlockElement} from '../types';

import fromGraphQLResponse, {inlineFromGraphQL} from './from-graphql';
import toGraphQLInput, {formattedTextToGraphQLInput} from './to-graphql';
import {TableCaption, TableCaptionInput} from './types';

export const emptyDescription = (): BlockElement[] => [
  {
    type: 'paragraph',
    children: [{text: ''}],
  },
];

export const descriptionFromGraphQLResponse = fromGraphQLResponse;

export const descriptionToGraphQLInput = toGraphQLInput;

export const emptyTableCaption = emptyDescription;

export const tableCaptionFromGraphQLResponse = (
  caption: TableCaption
): BlockElement[] => [
  {
    type: 'paragraph',
    children: caption.inlines.map(inlineFromGraphQL),
  },
];

export const tableCaptionToGraphQLInput = (
  caption: BlockElement[]
): TableCaptionInput => ({
  inlines: caption[0].children.map(child => {
    if (Element.isElement(child)) {
      throw new Error('Links are not allowed in this context');
    }
    return formattedTextToGraphQLInput(child);
  }),
});
