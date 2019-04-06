export interface TagRow {
  id: number;
  name: string;
}

export interface DefinitionTagRow extends TagRow {
  definition_id: number;
}

export interface LemmaTagRow extends TagRow {
  lemma_id: number;
}
