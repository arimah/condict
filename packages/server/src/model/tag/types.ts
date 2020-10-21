import {TagId, LemmaId, DefinitionId} from '../../graphql';

export type TagRow = {
  id: TagId;
  name: string;
};

export type DefinitionTagRow = TagRow & {
  definition_id: DefinitionId;
};

export type LemmaTagRow = TagRow & {
  lemma_id: LemmaId;
};
