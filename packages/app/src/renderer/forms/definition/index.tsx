import {ReactNode, RefObject, useMemo, useCallback} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import shallowEqual from 'shallowequal';

import {genUniqueId} from '@condict/ui';
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
import {LanguageId, PartOfSpeechId} from '../../graphql';
import type {NewPartOfSpeech, NewInflectionTable} from '../../panels';

import {notEmpty} from '../validators';

import usePartOfSpeechOptions from './part-of-speech-options';
import TableList from './table-list';
import StemsField from './stems-field';
import {
  DefinitionData,
  DefinitionFormState,
  PartOfSpeechFields,
  InflectionTableFields,
} from './types';
import {useSyncFormDirtiness} from '../utils';
import useInflectionTableOptions from './inflection-table-options';

export type Props = {
  languageId: LanguageId;
  initialPartsOfSpeech: PartOfSpeechFields[];
  initialInflectionTables: InflectionTableFields[];
  initialData?: DefinitionData;
  submitError?: ReactNode;
  firstFieldRef?: RefObject<HTMLElement>;
  onSubmit: (data: DefinitionData) => Promise<void> | void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onCreatePartOfSpeech: () => Promise<NewPartOfSpeech | null>;
  onCreateInflectionTable: () => Promise<NewInflectionTable | null>;
};

export {DefinitionData};

const EmptyData: DefinitionData = {
  id: null,
  term: '',
  partOfSpeech: null,
  description: emptyDescription(),
  inflectionTables: [],
  stems: new Map<string, string>(),
  tags: [],
};

export const DefinitionForm = (props: Props): JSX.Element => {
  const {
    languageId,
    initialPartsOfSpeech,
    initialInflectionTables,
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
    };
    return onSubmit(submittedData);
  }, [partsOfSpeech, onSubmit]);

  const partOfSpeechOptions = useMemo<JSX.Element[]>(() => {
    return partsOfSpeech.map(pos =>
      <option key={pos.id} value={String(pos.id)}>
        {pos.name}
      </option>
    );
  }, [partsOfSpeech]);

  const hasPartsOfSpeech = partsOfSpeech.length > 0 ? 'yes' : 'no';

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
          mapValueToOption={partOfSpeechValueToOption}
          mapOptionToValue={partOfSpeechOptionToValue}
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
        >
          <option disabled value=''>
            {l10n.getString('definition-part-of-speech-empty-hint', {
              hasPartsOfSpeech,
            })}
          </option>
          {partOfSpeechOptions}
        </SelectField>
        <TableList
          inflectionTables={inflectionTables}
          onCreateInflectionTable={onCreateInflectionTable}
        />
        <StemsField/>
        <TagField
          name='tags'
          label={<Localized id='definition-tags-label'/>}
        />
        <FormButtons submitError={submitError} onCancel={onCancel}/>
      </form>
    </FormProvider>
  );
};

type PartOfSpeechValue = DefinitionData['partOfSpeech'];

const partOfSpeechValueToOption = (value: PartOfSpeechValue): string =>
  value !== null ? String(value) : '';

const partOfSpeechOptionToValue = (value: string): PartOfSpeechValue =>
  value !== ''
    ? Number(value) as PartOfSpeechId
    : null;

const validatePartOfSpeech = (value: PartOfSpeechValue): 'invalid' | null =>
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
