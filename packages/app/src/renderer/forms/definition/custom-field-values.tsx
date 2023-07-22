import React, {useMemo} from 'react';
import {Localized} from '@fluent/react';

import {FieldInput, useUniqueId} from '@condict/ui';

import {useNearestForm, useFormValue, useFormState, useField} from '../../form';
import {Field, Label, TextField} from '../../form-fields';
import {FieldValueId, PartOfSpeechId} from '../../graphql';

import {PartOfSpeechData} from '../utils';

import {DefinitionFormState, FieldData, isFieldSelectable} from './types';
import * as S from './styles';

export type Props = {
  allFields: FieldData[];
  partsOfSpeech: readonly PartOfSpeechData[];
};

const CustomFieldValues = React.memo((props: Props): JSX.Element => {
  const {allFields, partsOfSpeech} = props;

  const form = useNearestForm<DefinitionFormState>();

  const partOfSpeechId = useFormValue<PartOfSpeechId | null>(
    form,
    'partOfSpeech'
  );
  const fieldValues = useFormValue<DefinitionFormState['fields']>(
    form,
    'fields'
  );

  const [globalFields, posFields] = useMemo(() => [
    allFields.filter(field =>
      // If there is no value for the field, it probably means the field was
      // just created. We should receive a value for it soon.
      fieldValues[field.id] != null &&
      field.partsOfSpeech == null
    ),
    allFields.filter(field =>
      fieldValues[field.id] != null &&
      field.partsOfSpeech != null &&
      isFieldSelectable(field, partOfSpeechId)
    ),
  ], [allFields, partOfSpeechId, fieldValues]);

  const partOfSpeechName = useMemo(
    () => partsOfSpeech.find(p => p.id === partOfSpeechId)?.name ?? '',
    [partsOfSpeech, partOfSpeechId]
  );

  const id = useUniqueId();

  return <>
    {globalFields.length > 0 &&
      <div role='group' aria-labelledby={`${id}-global`}>
        <S.CustomFieldsHeading id={`${id}-global`}>
          <Localized
            id='definition-custom-fields-global-label'
            elems={{bold: <b/>}}
          >
            <></>
          </Localized>
        </S.CustomFieldsHeading>
        <S.CustomFieldGroup>
          {globalFields.map(renderFieldValue)}
        </S.CustomFieldGroup>
      </div>
    }

    {posFields.length > 0 &&
      <div role='group' aria-labelledby={`${id}-pos`}>
        <S.CustomFieldsHeading id={`${id}-pos`}>
          <Localized
            id='definition-custom-fields-part-of-speech-label'
            vars={{partOfSpeech: partOfSpeechName}}
            elems={{bold: <b/>}}
          >
            <></>
          </Localized>
        </S.CustomFieldsHeading>
        <S.CustomFieldGroup>
          {posFields.map(renderFieldValue)}
        </S.CustomFieldGroup>
      </div>
    }
  </>;
});

CustomFieldValues.displayName = 'CustomFieldValues';

export default CustomFieldValues;

const renderFieldValue = (field: FieldData): JSX.Element => {
  switch (field.valueType) {
    case 'FIELD_BOOLEAN':
      return <BooleanValue key={field.id} field={field}/>;
    case 'FIELD_LIST_ONE':
    case 'FIELD_LIST_MANY':
      return <ListValue key={field.id} field={field}/>;
    case 'FIELD_PLAIN_TEXT':
      return <TextValue key={field.id} field={field}/>;
  }
};

type FieldValueProps = {
  field: FieldData;
};

const BooleanValue = React.memo((props: FieldValueProps): JSX.Element => {
  const {field: customField} = props;

  const form = useNearestForm<DefinitionFormState>();
  const state = useFormState(form);

  const field = useField<boolean>(form, `fields.${customField.id}.boolean`);

  return (
    <Field>
      <S.BooleanFieldInput
        checked={field.value}
        readOnly={state.isSubmitting}
        onChange={e => field.set(e.target.checked)}
      >
        {customField.name}
      </S.BooleanFieldInput>
    </Field>
  );
});

BooleanValue.displayName = 'BooleanValue';

const ListValue = React.memo((props: FieldValueProps): JSX.Element => {
  const {field: customField} = props;

  const {knownValues, getName} = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const values = customField.listValues!;
    const map = new Map(values.map(v => [v.id, v]));
    return {
      knownValues: values.map(v => v.id),
      getName: (id: FieldValueId) => map.get(id)?.value ?? `<${id}>`,
    };
  }, [customField.listValues]);

  const form = useNearestForm<DefinitionFormState>();
  const state = useFormState(form);

  const field = useField<FieldValueId[]>(form, `fields.${customField.id}.list`);

  const id = useUniqueId();

  return (
    <Field>
      <Label id={id}>{customField.name}</Label>
      <FieldInput
        aria-labelledby={id}
        values={field.value}
        getKey={getListValueKey}
        getName={getName}
        mode={customField.valueType === 'FIELD_LIST_ONE' ? 'single' : 'multi'}
        knownValues={knownValues}
        readOnly={state.isSubmitting}
        onChange={field.set}
      />
    </Field>
  );
});

const getListValueKey = (id: FieldValueId): number => id;

ListValue.displayName = 'ListValue';

const TextValue = React.memo((props: FieldValueProps): JSX.Element => {
  const {field: customField} = props;
  return (
    <TextField
      name={`fields.${customField.id}.plainText`}
      label={customField.name}
    />
  );
});

TextValue.displayName = 'TextValue';
