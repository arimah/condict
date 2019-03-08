export interface LanguageRow {
  id: number;
  lemma_count: number;
  name: string;
  url_name: string;
}

export interface NewLanguageInput {
  name: string;
  urlName: string;
}

export interface EditLanguageInput {
  name?: string | null;
  urlName?: string | null;
}
