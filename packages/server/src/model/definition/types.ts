import {
  DefinitionId,
  DefinitionInflectionTableId,
  LanguageId,
  LemmaId,
  PartOfSpeechId,
  InflectionTableId,
  InflectionTableLayoutId,
  InflectedFormId,
} from '../../graphql';

import {DescriptionId} from '../description';

export type DefinitionRow = {
  id: DefinitionId;
  lemma_id: LemmaId;
  language_id: LanguageId;
  part_of_speech_id: PartOfSpeechId;
  description_id: DescriptionId;
  time_created: number;
  time_updated: number;
  term: string;
};

export type DefinitionStemRow = {
  definition_id: DefinitionId;
  name: string;
  value: string;
};

export type DefinitionInflectionTableRow = {
  id: DefinitionInflectionTableId;
  definition_id: DefinitionId;
  inflection_table_id: InflectionTableId;
  inflection_table_version_id: InflectionTableLayoutId;
  sort_order: number;
  caption: string;
};

export type CustomInflectedFormRow = {
  definition_inflection_table_id: DefinitionInflectionTableId;
  inflected_form_id: InflectedFormId;
  inflected_form: string;
};

export type DerivedDefinitionRow = {
  lemma_id: LemmaId;
  original_definition_id: DefinitionId;
  inflected_form_id: InflectedFormId;
  language_id: LanguageId;
  term: string;
};
