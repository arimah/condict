import {useState, useRef} from 'react';

import {useExecute, useDictionaryEvents} from '../../data';
import {LanguageId} from '../../graphql';
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
}: Options): FieldData[] => {
  const [customFields, setCustomFields] = useState(initialCustomFields);

  const execute = useExecute();

  const requestId = useRef(0);
  useDictionaryEvents(({events}) => {
    const needRefetch = events.some(event =>
      event.type === 'field' &&
      event.languageId === languageId
    );
    if (!needRefetch) {
      return;
    }

    const id = ++requestId.current;
    void execute(AllFieldsQuery, {lang: languageId}).then(result => {
      if (result.errors) {
        console.error('Error fetching custom fields:', result.errors);
        return;
      }

      if (id !== requestId.current) {
        // Old request; ignore results.
        return;
      }

      // If there were no errors, there should be a result. If the language
      // has been deleted, just use an empty list.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const customFields = result.data!.language?.fields ?? [];

      setCustomFields(customFields);
      // If there are any new fields, we need to add empty values for them,
      // or the form will refuse to show them as the path does not exist.
      form.update<DefinitionFormState['fields']>('fields', fieldValues => {
        for (const field of customFields) {
          if (!fieldValues[field.id]) {
            fieldValues[field.id] = EmptyFieldValue;
          }
        }
      });
    });
  });

  return customFields;
};

export default useCustomFields;
