import {IdOf, InputIdOf} from '../id-of';
import {LemmaId} from '../lemma/types';
import {DefinitionId} from '../definition/types';

export type TagId = IdOf<'Tag'>;
export type TagInputId = InputIdOf<'Tag'>;

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
