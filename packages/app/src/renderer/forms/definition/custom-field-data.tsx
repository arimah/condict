import {useLiveData} from '../../data';
import {LanguageId, OperationResult} from '../../graphql';
import {Form} from '../../form';

import {AllFieldsQuery} from './query';
import {DefinitionFormState, FieldData, EmptyFieldValue} from './types';

export type Options = {
  form: Form<DefinitionFormState>;
  languageId: LanguageId;
  initialCustomFields: FieldData[];
};

const useCustomFields = ({
  form,
  languageId,
  initialCustomFields,
}: Options): FieldData[] =>
  useLiveData(AllFieldsQuery, {lang: languageId}, {
    initial: initialCustomFields,
    mapData,

    shouldReload: event =>
      event.type === 'field' &&
      event.languageId === languageId,

    ignoreReloadErrors: true,

    onLoadedData: customFields => {
      // If there are any new fields, we need to add empty values for them,
      // or the form will refuse to show them as the path does not exist.
      form.update<DefinitionFormState['fields']>('fields', fieldValues => {
        for (const field of customFields) {
          if (!fieldValues[field.id]) {
            fieldValues[field.id] = EmptyFieldValue;
          }
        }
      });
    },
  }).data;

export default useCustomFields;

const mapData = (data: OperationResult<typeof AllFieldsQuery>): FieldData[] =>
  // If the language has been deleted, use an empty list.
  data.language?.fields ?? [];
