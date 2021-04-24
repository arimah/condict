import {Element} from 'slate';

import {BlockElement} from '../types';

import fromGraphQLResponse, {inlineFromGraphQL} from './from-graphql';
import toGraphQLInput, {formattedTextToGraphQLInput} from './to-graphql';
import {TableCaption, TableCaptionInput} from './types';

export * from './types';

const Value = {
  descriptionFromGraphQLResponse: fromGraphQLResponse,

  tableCaptionFromGraphQLResponse(caption: TableCaption): BlockElement[] {
    return [
      {
        type: 'paragraph',
        children: caption.inlines.map(inlineFromGraphQL),
      },
    ];
  },

  descriptionToGraphQLInput: toGraphQLInput,

  tableCaptionToGraphQLInput(caption: BlockElement[]): TableCaptionInput {
    return {
      inlines: caption[0].children.map(child => {
        if (Element.isElement(child)) {
          throw new Error('Links are not allowed in this context');
        }
        return formattedTextToGraphQLInput(child);
      }),
    };
  },
} as const;

export default Value;
