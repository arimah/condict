import {ReactNode, RefObject, useMemo, useCallback} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import shallowEqual from 'shallowequal';

import {SelectOption, genUniqueId} from '@condict/ui';

import {FormProvider, useForm} from '../../form';
import {TextField, SelectField, FormButtons} from '../../form-fields';
import {LanguageId} from '../../graphql';
import {useExecute} from '../../data';

import {nameNotTaken, notEmpty} from '../validators';
import {PartOfSpeechFields, useSyncFormDirtiness} from '../utils';

import PartsOfSpeechField from './parts-of-speech-field';
import ListValuesField from './list-values-field';
import {CheckNameQuery} from './query';
import {
  FieldData,
  FieldFormState,
  FormValueType,
  getFormValueType,
  getGqlValueType,
} from './types';

export type Props = {
  languageId: LanguageId;
  initialPartsOfSpeech: readonly PartOfSpeechFields[];
  initialData?: FieldData;
  submitError?: ReactNode;
  firstFieldRef?: RefObject<HTMLElement>;
  onSubmit: (data: FieldData) => Promise<void> | void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export {FieldData};

const EmptyData: FieldData = {
  id: null,
  name: '',
  nameAbbr: '',
  partOfSpeechIds: null,
  valueType: 'FIELD_LIST_ONE',
  listValues: [],
};

export const FieldForm = (props: Props): JSX.Element => {
  const {
    languageId,
    initialPartsOfSpeech,
    initialData,
    submitError,
    firstFieldRef,
    onSubmit,
    onCancel,
    onDirtyChange,
  } = props;

  const {l10n} = useLocalization();

  const form = useForm<FieldFormState>({
    initValue: () => {
      const data = initialData ?? EmptyData;
      return {
        id: data.id,
        name: data.name,
        nameAbbr: data.nameAbbr,
        partsOfSpeech: data.partOfSpeechIds ?? [],
        wasEmptyPosSelection: data.partOfSpeechIds?.length === 0,
        valueType: getFormValueType(data.valueType),
        multiSelectList: data.valueType === 'FIELD_LIST_MANY',
        listValues: data.listValues?.map(val => ({
          key: genUniqueId(),
          ...val,
        })) ?? [],
      };
    },
    isUnchanged,
  });

  useSyncFormDirtiness(form, onDirtyChange);

  const handleSubmit = useCallback((
    data: FieldFormState
  ): Promise<void> | void => {
    const submittedData: FieldData = {
      id: data.id,
      name: data.name,
      nameAbbr: data.nameAbbr,
      partOfSpeechIds: data.partsOfSpeech,
      valueType: getGqlValueType(data),
      listValues: data.valueType === 'list'
        // Strip the key from each list value
        ? data.listValues.map(({key: _key, ...val}) => val)
        : null,
    };
    return onSubmit(submittedData);
  }, [onSubmit]);

  // TODO: disable value type change for existing field used by definitions
  const canChangeValueType = true;

  const valueTypeOptions = useMemo(() => {
    const initialType = form.initialValue.valueType;
    const options: readonly SelectOption<FormValueType>[] = [
      {
        value: 'list',
        name: l10n.getString('field-value-type-list'),
        disabled: !canChangeValueType && initialType !== 'list',
      },
      {
        value: 'boolean',
        name: l10n.getString('field-value-type-boolean'),
        disabled: !canChangeValueType && initialType !== 'boolean',
      },
      {
        value: 'plainText',
        name: l10n.getString('field-value-type-plain-text'),
        disabled: !canChangeValueType && initialType !== 'plainText',
      },
    ];
    return options;
  }, [l10n]);

  const execute = useExecute();

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <TextField
          name='name'
          label={<Localized id='field-name-label'/>}
          aria-required
          validate={[
            notEmpty,
            nameNotTaken(
              initialData?.id ?? null,
              name => execute(CheckNameQuery, {lang: languageId, name}),
              data => data.language?.fieldByName?.id ?? null
            ),
          ]}
          errorMessages={{
            empty: <Localized id='field-name-required-error'/>,
            taken: <Localized id='field-name-taken-error'/>,
          }}
          inputRef={firstFieldRef as RefObject<HTMLInputElement> | undefined}
        />
        <TextField
          name='nameAbbr'
          label={<Localized id='field-name-abbr-label'/>}
        />
        <PartsOfSpeechField
          languageId={languageId}
          initialPartsOfSpeech={initialPartsOfSpeech}
        />
        <SelectField
          name='valueType'
          label={<Localized id='field-value-type-label'/>}
          options={valueTypeOptions}
        />
        <ListValuesField/>
        <FormButtons submitError={submitError} onCancel={onCancel}/>
      </form>
    </FormProvider>
  );
};

const isUnchanged = (
  current: FieldFormState,
  initial: FieldFormState
): boolean =>
  shallowEqual(current, initial, customCompareFormState);

const customCompareFormState = (
  a: any,
  b: any,
  // keyof FieldFormState
  key: string | number | undefined
): boolean | void => {
  if (key === 'listValues') {
    return shallowEqual(a, b, customCompareListValue);
  }
};

const customCompareListValue = (
  a: any,
  b: any,
  // index into FieldValueFormData[]
  key: string | number | undefined
): boolean | void => {
  if (key !== undefined) {
    return shallowEqual(a, b);
  }
};
