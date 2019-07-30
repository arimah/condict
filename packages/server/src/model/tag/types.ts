import {IdOf, InputIdOf} from '../id-of';
import {LemmaId} from '../lemma/types';
import {DefinitionId} from '../definition/types';

export type TagId = IdOf<'Tag'>;
export type TagInputId = InputIdOf<'Tag'>;

export interface TagRow {
  id: TagId;
  name: string;
}

export interface DefinitionTagRow extends TagRow {
  definition_id: DefinitionId;
}

export interface LemmaTagRow extends TagRow {
  lemma_id: LemmaId;
}
