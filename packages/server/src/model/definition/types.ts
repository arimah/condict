import {
  BlockElementInput,
  TableCaptionInput,
} from '../../rich-text/types';

import {IdOf, InputIdOf} from '../id-of';
import {LanguageId, LanguageInputId} from '../language/types';
import {LemmaId} from '../lemma/types';
import {PartOfSpeechId, PartOfSpeechInputId} from '../part-of-speech/types';
import {
  InflectionTableId,
  InflectionTableInputId,
  InflectionTableLayoutId,
  InflectedFormId,
  InflectedFormInputId,
} from '../inflection-table/types';

export type DefinitionId = IdOf<'Definition'>;
export type DefinitionInputId = InputIdOf<'Definition'>;
export type DefinitionInflectionTableId = IdOf<'DefinitionInflectionTable'>;
export type DefinitionInflectionTableInputId = InputIdOf<'DefinitionInflectionTable'>;

export interface DefinitionRow {
  id: DefinitionId;
  lemma_id: LemmaId;
  language_id: LanguageId;
  part_of_speech_id: PartOfSpeechId;
  term: string;
}

export interface DefinitionDescriptionRow {
  definition_id: DefinitionId;
  /** JSON-serialized data */
  description: string;
}

export interface DefinitionStemRow {
  definition_id: DefinitionId;
  name: string;
  value: string;
}

export interface DefinitionInflectionTableRow {
  id: DefinitionInflectionTableId;
  definition_id: DefinitionId;
  inflection_table_id: InflectionTableId;
  inflection_table_version_id: InflectionTableLayoutId;
  sort_order: number;
  caption: string;
}

export interface CustomInflectedFormRow {
  definition_inflection_table_id: DefinitionInflectionTableId;
  inflected_form_id: InflectedFormId;
  inflected_form: string;
}

export interface DerivedDefinitionRow {
  lemma_id: LemmaId;
  original_definition_id: DefinitionId;
  inflected_form_id: InflectedFormId;
  term: string;
  language_id: LanguageId;
}

export interface NewDefinitionInput {
  languageId: LanguageInputId;
  term: string;
  partOfSpeechId: PartOfSpeechInputId;
  description: BlockElementInput[];
  stems: StemInput[];
  inflectionTables: NewDefinitionInflectionTableInput[];
  tags: string[];
}

export interface EditDefinitionInput {
  term?: string | null;
  partOfSpeechId?: PartOfSpeechInputId | null;
  description?: BlockElementInput[] | null;
  stems?: StemInput[] | null;
  inflectionTables?: EditDefinitionInflectionTableInput[] | null;
  tags?: string[] | null;
}

export interface StemInput {
  name: string;
  value: string;
}

export interface NewDefinitionInflectionTableInput {
  caption?: TableCaptionInput | null;
  customForms: CustomInflectedFormInput[];
  inflectionTableId: InflectionTableInputId;
}

export interface EditDefinitionInflectionTableInput {
  id?: DefinitionInflectionTableInputId | null;
  caption?: TableCaptionInput | null;
  customForms: CustomInflectedFormInput[];
  inflectionTableId: InflectionTableInputId;
  upgradeTableLayout?: boolean | null;
}

export interface CustomInflectedFormInput {
  inflectedFormId: InflectedFormInputId;
  value: string;
}
