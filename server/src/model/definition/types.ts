import {BlockElementInput, InlineElementInput} from '../../rich-text/types';

export interface DefinitionRow {
  id: number;
  lemma_id: number;
  language_id: number;
  part_of_speech_id: number;
  term: string;
}

export interface DefinitionDescriptionRow {
  definition_id: number;
  /** JSON-serialized data */
  description: string;
}

export interface DefinitionStemRow {
  definition_id: number;
  name: string;
  value: string;
}

export interface DefinitionInflectionTableRow {
  id: number;
  definition_id: number;
  inflection_table_id: number;
  sort_order: number;
  caption: string;
}

export interface CustomInflectedFormRow {
  definition_inflection_table_id: number;
  inflected_form_id: number;
  inflected_form: string;
}

export interface DerivedDefinitionRow {
  lemma_id: number;
  original_definition_id: number;
  inflected_form_id: number;
  term: string;
  language_id: number;
}

export interface NewDefinitionInput {
  languageId: string;
  term: string;
  partOfSpeechId: string;
  description: BlockElementInput[];
  stems: StemInput[];
  inflectionTables: DefinitionInflectionTableInput[];
}

export interface EditDefinitionInput {
  term?: string | null;
  partOfSpeechId?: string | null;
  description?: BlockElementInput[] | null;
  stems?: StemInput[] | null;
  inflectionTables?: DefinitionInflectionTableInput[] | null;
}

export interface StemInput {
  name: string;
  value: string;
}

export interface DefinitionInflectionTableInput {
  id?: string | null;
  caption?: TableCaptionInput | null;
  customForms: CustomInflectedFormInput[];
  inflectionTableId: string;
}

export interface TableCaptionInput {
  text: string;
  inlines?: InlineElementInput[] | null;
}

export interface CustomInflectedFormInput {
  inflectedFormId: string;
  value: string;
}
