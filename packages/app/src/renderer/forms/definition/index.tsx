import {ReactNode, RefObject, useMemo, useCallback} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import shallowEqual from 'shallowequal';

import {SelectOption, genUniqueId} from '@condict/ui';
import {emptyDescription} from '@condict/rich-text-editor';
import {DefinitionTable} from '@condict/table-editor';

import {FormProvider, useForm} from '../../form';
import {
  TextField,
  SelectField,
  DescriptionField,
  TagField,
  FormButtons,
} from '../../form-fields';
import {LanguageId, PartOfSpeechId, FieldId, FieldValueId} from '../../graphql';
import type {NewPartOfSpeech, NewInflectionTable} from '../../panels';

import {PartOfSpeechData, useSyncFormDirtiness} from '../utils';
import {notEmpty} from '../validators';

import usePartOfSpeechOptions from './part-of-speech-options';
import useInflectionTableOptions from './inflection-table-options';
import useCustomFields from './custom-field-data';
import TableList from './table-list';
import StemsField from './stems-field';
import CustomFieldValues from './custom-field-values';
import {
  DefinitionData,
  DefinitionTableData,
  DefinitionFieldData,
  DefinitionFormState,
  DefinitionFieldValue,
  InflectionTableData,
  FieldData,
  EmptyFieldValue,
  isFieldSelectable,
} from './types';

export type Props = {
  languageId: LanguageId;
  initialPartsOfSpeech: PartOfSpeechData[];
  initialInflectionTables: InflectionTableData[];
  initialCustomFields: FieldData[];
  initialData?: DefinitionData;
  submitError?: ReactNode;
  firstFieldRef?: RefObject<HTMLElement>;
  onSubmit: (data: DefinitionData) => Promise<void> | void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onCreatePartOfSpeech: () => Promise<NewPartOfSpeech | null>;
  onCreateInflectionTable: () => Promise<NewInflectionTable | null>;
};

export {DefinitionData, DefinitionTableData, DefinitionFieldData};

const EmptyData: DefinitionData = {
  id: null,
  term: '',
  partOfSpeech: null,
  description: emptyDescription(),
  inflectionTables: [],
  stems: new Map<string, string>(),
  tags: [],
  fields: [],
};

export const DefinitionForm = (props: Props): JSX.Element => {
  const {
    languageId,
    initialPartsOfSpeech,
    initialInflectionTables,
    initialCustomFields,
    initialData,
    submitError,
    firstFieldRef,
    onSubmit,
    onCancel,
    onDirtyChange,
    onCreatePartOfSpeech,
    onCreateInflectionTable,
  } = props;

  const {l10n} = useLocalization();

  const form = useForm<DefinitionFormState>({
    initValue: () => {
      const data = initialData ?? EmptyData;
      return {
        ...data,
        inflectionTables: data.inflectionTables.map(table => ({
          key: genUniqueId(),
          ...table,
        })),
        fields: importFieldData(data.fields, initialCustomFields),
      };
    },
    isUnchanged,
  });

  useSyncFormDirtiness(form, onDirtyChange);

  const {
    partsOfSpeech,
    handleCreatePartOfSpeech,
  } = usePartOfSpeechOptions({
    form,
    languageId,
    initialPartsOfSpeech,
    onCreatePartOfSpeech,
  });

  const inflectionTables = useInflectionTableOptions({
    languageId,
    initialInflectionTables,
  });

  const customFields = useCustomFields({
    form,
    languageId,
    initialCustomFields,
  });

  const handleSubmit = useCallback((
    data: DefinitionFormState
  ): Promise<void> | void => {
    const tables = data.inflectionTables;
    const exportedStems = new Set(tables.flatMap(t => t.stems));

    const submittedData: DefinitionData = {
      ...data,
      // Strip the `key` from the selected inflection tables.
      inflectionTables: tables.map(({key: _key, ...table}) => table),
      // Remove stems that are not used by any of the inflection tables.
      stems: new Map(
        [...data.stems].filter(([name]) =>
          exportedStems.has(name)
        )
      ),
      // Convert field values to the right format
      fields: exportFieldValues(
        data.fields,
        data.partOfSpeech,
        customFields
      ),
    };
    return onSubmit(submittedData);
  }, [onSubmit, customFields]);

  const hasPartsOfSpeech = partsOfSpeech.length > 0 ? 'yes' : 'no';

  const partOfSpeechOptions = useMemo(() => {
    const options: readonly SelectOption<PartOfSpeechId | null>[] = [
      {
        key: '',
        value: null,
        name: l10n.getString('definition-part-of-speech-empty-hint', {
          hasPartsOfSpeech,
        }),
        disabled: true,
      },
      ...partsOfSpeech.map(pos => ({
        key: String(pos.id),
        value: pos.id,
        name: pos.name,
      })),
    ];
    return options;
  }, [partsOfSpeech, hasPartsOfSpeech, l10n]);

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <TextField
          name='term'
          label={<Localized id='definition-term-label'/>}
          aria-required
          validate={notEmpty}
          defaultError={<Localized id='definition-term-required-error'/>}
          inputRef={firstFieldRef as RefObject<HTMLInputElement> | undefined}
        />
        <DescriptionField
          name='description'
          label={<Localized id='definition-description-label'/>}
        />
        <SelectField
          name='partOfSpeech'
          label={<Localized id='definition-part-of-speech-label'/>}
          options={partOfSpeechOptions}
          validate={validatePartOfSpeech}
          defaultError={
            <Localized
              id='definition-part-of-speech-required-error'
              vars={{hasPartsOfSpeech}}
            />
          }
          createLabel={
            <Localized id='definition-create-part-of-speech-button'/>
          }
          onCreateNew={handleCreatePartOfSpeech}
        />
        <TableList
          inflectionTables={inflectionTables}
          onCreateInflectionTable={onCreateInflectionTable}
        />
        <StemsField/>
        <TagField
          name='tags'
          label={<Localized id='definition-tags-label'/>}
        />
        <CustomFieldValues
          allFields={customFields}
          partsOfSpeech={partsOfSpeech}
        />
        <FormButtons submitError={submitError} onCancel={onCancel}/>
      </form>
    </FormProvider>
  );
};

const importFieldData = (
  fieldValues: DefinitionFieldData[],
  allFields: FieldData[]
): Record<FieldId, DefinitionFieldValue> => {
  const result: Record<FieldId, DefinitionFieldValue> = {};

  for (const field of fieldValues) {
    result[field.fieldId] = importFieldValue(field);
  }

  // Fill in empty values for every field that lacks a value - it drastically
  // simplifies form interactions down the line.
  for (const field of allFields) {
    if (!result[field.id]) {
      result[field.id] = EmptyFieldValue;
    }
  }

  return result;
};

const importFieldValue = (field: DefinitionFieldData): DefinitionFieldValue => {
  let bool = false;
  let plainText = '';
  let list: FieldValueId[] = [];

  switch (field.type) {
    case 'boolean':
      bool = field.value;
      break;
    case 'plainText':
      plainText = field.value;
      break;
    case 'list':
      list = field.value;
      break;
  }

  return {boolean: bool, plainText, list};
};

const exportFieldValues = (
  values: Readonly<Record<FieldId, DefinitionFieldValue>>,
  partOfSpeech: PartOfSpeechId | null,
  fields: readonly FieldData[]
): DefinitionFieldData[] => {
  const fieldsWithValues = fields.filter(f =>
    values[f.id] != null &&
    isFieldSelectable(f, partOfSpeech)
  );
  return fieldsWithValues.map(f => {
    const value = values[f.id];
    switch (f.valueType) {
      case 'FIELD_BOOLEAN':
        return {
          type: 'boolean',
          fieldId: f.id,
          value: value.boolean,
        };
      case 'FIELD_LIST_ONE':
        return {
          type: 'list',
          fieldId: f.id,
          // Forcefully select only the first value if it's a single-select
          // field.
          value: value.list.slice(0, 1),
        };
      case 'FIELD_LIST_MANY':
        return {
          type: 'list',
          fieldId: f.id,
          value: value.list,
        };
      case 'FIELD_PLAIN_TEXT':
        return {
          type: 'plainText',
          fieldId: f.id,
          value: value.plainText,
        };
    }
  });
};

const validatePartOfSpeech = (value: PartOfSpeechId | null): 'invalid' | null =>
  value === null ? 'invalid' : null;

const isUnchanged = (
  current: DefinitionFormState,
  initial: DefinitionFormState
): boolean =>
  shallowEqual(current, initial, customCompareFormState);

const customCompareFormState = (
  a: any,
  b: any,
  // keyof DefinitionFormState
  key: string | number | undefined
): boolean | void => {
  if (key === 'inflectionTables') {
    return shallowEqual(a, b, customCompareTableEntry);
  }
};

const customCompareTableEntry = (
  a: any,
  b: any,
  // index into DefinitionTableData[]
  key: string | number | undefined
): boolean | void => {
  if (key !== undefined) {
    return shallowEqual(a, b, customCompareTable);
  }
};

const customCompareTable = (
  a: any,
  b: any,
  // keyof DefinitionTableData
  key: string | number | undefined
): boolean | void => {
  if (key === 'table') {
    const tableA = a as DefinitionTable;
    const tableB = b as DefinitionTable;
    return (
      tableA.rows === tableB.rows &&
      tableA.cells === tableB.cells &&
      tableA.cellData === tableB.cellData
    );
  }
};
