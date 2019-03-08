export interface PartOfSpeechRow {
  id: number;
  language_id: number;
  name: string;
}

export interface NewPartOfSpeechInput {
  languageId: string;
  name: string;
}

export interface EditPartOfSpeechInput {
  name?: string | null;
}
