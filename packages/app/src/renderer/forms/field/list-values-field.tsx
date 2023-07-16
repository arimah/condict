import React, {useState, useMemo, useCallback, useEffect, useRef} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import AddIcon from 'mdi-react/PlusIcon';
import DeleteIcon from 'mdi-react/CloseIcon';
import UndoIcon from 'mdi-react/UndoIcon';

import {Button, Checkbox, genUniqueId, useUniqueId} from '@condict/ui';

import {useExecute} from '../../data';
import {OperationResult} from '../../graphql';
import {Validators, useNearestForm, useField, useFormValue} from '../../form';
import {Field, Label, FieldGroup} from '../../form-fields';

import {notEmpty} from '../validators';

import {ValidateValuesMut} from './query';
import {FieldFormState, FieldValueFormData, FormValueType} from './types';
import * as S from './styles';

interface UndoItem {
  value: FieldValueFormData;
  index: number;
}

type ValidationResult = OperationResult<typeof ValidateValuesMut>[
  'validateFieldValues'
];

const ValidationSuccess: ValidationResult = {
  valid: true,
  invalid: null,
  duplicates: null,
};

const ListValuesField = React.memo((): JSX.Element | null => {
  const execute = useExecute();

  const form = useNearestForm<FieldFormState>();

  const valueType = useFormValue<FormValueType>(form, 'valueType');

  const valuesField = useField<FieldValueFormData[]>(form, 'listValues');
  const multiSelectField = useField<boolean>(form, 'multiSelectList');

  const [focusOnMount, setFocusOnMount] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<UndoItem[]>([]);

  const validateValue = useMemo(() => {
    let allPromise: Promise<ValidationResult> | null = null;
    const validateAll = (): Promise<ValidationResult> => {
      if (!allPromise) {
        const values = valuesField.value.map(v => v.value);
        allPromise = execute(ValidateValuesMut, {values}).then(result => {
          if (result.errors || !result.data?.validateFieldValues) {
            // Let validation pass for now. When the form is submitted, the
            // server will perform its own validation.
            return ValidationSuccess;
          }
          return result.data.validateFieldValues;
        }).finally(() => {
          allPromise = null;
        });
      }
      return allPromise;
    };

    return async (index: number): Promise<'empty' | 'duplicate' | null> => {
      const all = await validateAll();
      if (all.invalid?.includes(index)) {
        return 'empty';
      }
      if (all.duplicates?.some(d => d.indices.includes(index))) {
        return 'duplicate';
      }
      return null;
    };
  }, []);

  const handleAdd = useCallback(() => {
    const key = genUniqueId();
    setFocusOnMount(key);
    valuesField.update(values => {
      values.push({
        id: null,
        key,
        value: '',
        valueAbbr: '',
      });
    });
  }, []);

  const handleDelete = useCallback((index: number) => {
    const value = valuesField.value[index];
    if (canRestoreValue(value)) {
      setDeleted(del => [{value, index}, ...del]);
    }

    valuesField.update(values => {
      values.splice(index, 1);
    });
  }, []);

  const handleUndoDelete = useCallback(() => {
    const item = deleted[0];
    setDeleted(del => del.slice(1));

    valuesField.update(values => {
      values.splice(item.index, 0, item.value);
    });
  }, [deleted]);

  const id = useUniqueId();

  if (valueType !== 'list') {
    return null;
  }

  const {value: listValues} = valuesField;
  const {value: multiSelect} = multiSelectField;

  return (
    <Field role='group' aria-labelledby={`${id}-label`}>
      <Label id={`${id}-label`}>
        <Localized id='field-list-values-label'/>
      </Label>
      <FieldGroup>
        <S.ListValues>
          {listValues.length > 0 && <>
            <S.ListValueLabel id={`${id}-val`}>
              <Localized id='field-list-value-value-label'/>
            </S.ListValueLabel>
            <S.ListValueLabel id={`${id}-abbr`}>
              <Localized id='field-list-value-abbr-label'/>
            </S.ListValueLabel>
            <span/>
          </>}

          {listValues.map((value, index) =>
            <ListValueField
              key={value.key}
              name={`listValues.${value.key}`}
              path={`listValues.${index}`}
              index={index}
              htmlId={id}
              focusOnMount={focusOnMount === value.key}
              validate={validateValue}
              onDelete={handleDelete}
            />
          )}
        </S.ListValues>

        <S.ListValueActions>
          <Button onClick={handleAdd}>
            <AddIcon/>
            <span>
              <Localized id='field-add-list-value-button'/>
            </span>
          </Button>

          <Button disabled={deleted.length === 0} onClick={handleUndoDelete}>
            <UndoIcon/>
            <span>
              <Localized id='field-undo-delete-list-value-button'/>
            </span>
          </Button>
        </S.ListValueActions>

        <div>
          <Checkbox
            checked={multiSelect}
            onChange={e => multiSelectField.set(e.target.checked)}
          >
            <Localized id='field-multi-select-label'/>
          </Checkbox>
        </div>
      </FieldGroup>
    </Field>
  );
});

ListValuesField.displayName = 'ListValuesField';

export default ListValuesField;

type ListValueFieldProps = {
  name: string;
  path: string;
  index: number;
  htmlId: string;
  focusOnMount: boolean;
  validate: (index: number) => Promise<'empty' | 'duplicate' | null>;
  onDelete: (index: number) => void;
};

const ListValueField = React.memo((props: ListValueFieldProps): JSX.Element => {
  const {
    name,
    path,
    index,
    htmlId,
    focusOnMount,
    validate: validateValue,
    onDelete,
  } = props;

  const {l10n} = useLocalization();

  const form = useNearestForm<FieldFormState>();
  const validate = useMemo<Validators<string>>(() => {
    return [
      notEmpty,
      form.validateOnSubmit(() => validateValue(index)),
    ];
  }, [index, validateValue]);

  const valueRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focusOnMount) {
      valueRef.current?.focus();
    }
  }, []);

  return <>
    <S.ListValueTextField
      aria-labelledby={`${htmlId}-val`}
      name={`${name}.value`}
      path={`${path}.value`}
      validate={validate}
      errorMessages={{
        empty: <Localized id='field-list-value-empty-error'/>,
        duplicate: <Localized id='field-list-value-duplicate-error'/>,
      }}
      inputRef={valueRef}
    />

    <S.ListValueTextField
      aria-labelledby={`${htmlId}-abbr`}
      name={`${name}.valueAbbr`}
      path={`${path}.valueAbbr`}
    />

    <S.ListValueDeleteButton
      aria-label={l10n.getString('field-delete-list-value-button')}
      title={l10n.getString('field-delete-list-value-button')}
      onClick={() => onDelete(index)}
    >
      <DeleteIcon/>
    </S.ListValueDeleteButton>
  </>;
});

ListValueField.displayName = 'ListValueField';

const canRestoreValue = (value: FieldValueFormData): boolean =>
  // We can safely forget completely empty values - restoring them is identical
  // to pressing the add button
  value.id !== null ||
  value.value !== '' ||
  value.valueAbbr !== '';
