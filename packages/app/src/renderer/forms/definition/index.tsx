import {ReactNode, RefObject, useMemo, useCallback, useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {Localized, useLocalization} from '@fluent/react';

import {emptyDescription} from '@condict/rich-text-editor';

import {LanguageId, PartOfSpeechId} from '../../graphql';
import {
  TextField,
  SelectField,
  DescriptionField,
  TagField,
  FormButtons,
} from '../../form-fields';
import type {NewPartOfSpeech, NewInflectionTable} from '../../panels';

import {notEmpty} from '../validators';

import usePartOfSpeechOptions from './part-of-speech-options';
import TableList from './table-list';
import StemsField from './stems-field';
import {DefinitionData, PartOfSpeechFields} from './types';

export type Props = {
  languageId: LanguageId;
  initialPartsOfSpeech: PartOfSpeechFields[];
  initialData?: DefinitionData;
  submitError?: ReactNode;
  firstFieldRef?: RefObject<HTMLElement>;
  onSubmit: (data: DefinitionData) => Promise<void> | void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onCreatePartOfSpeech: () => Promise<NewPartOfSpeech | null>;
  onCreateInflectionTable: (
    partOfSpeechId: PartOfSpeechId
  ) => Promise<NewInflectionTable | null>;
};

export {DefinitionData};

const emptyData = (): DefinitionData => ({
  id: null,
  term: '',
  partOfSpeech: null,
  description: emptyDescription(),
  inflectionTables: [],
  stems: {
    map: new Map<string, string>(),
  },
  tags: [],
});

export const DefinitionForm = (props: Props): JSX.Element => {
  const {
    languageId,
    initialPartsOfSpeech,
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

  // HACK: useFieldArray is weird and sometimes updates defaultValues... This
  // obviously doesn't work well with a shared empty data object, so we need
  // to construct it on demand.
  const defaultValues = useMemo(() => initialData ?? emptyData(), []);

  const form = useForm<DefinitionData>({defaultValues});

  const {isDirty} = form.formState;
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty]);

  const {
    partsOfSpeech,
    partOfSpeechOptions,
    handleCreatePartOfSpeech,
  } = usePartOfSpeechOptions({
    form,
    languageId,
    initialPartsOfSpeech,
    onCreatePartOfSpeech,
  });

  const handleSubmit = useCallback((
    data: DefinitionData
  ): Promise<void> | void => {
    const pos = partsOfSpeech.find(p => p.id === data.partOfSpeech);

    const availableTables = new Set(pos?.inflectionTables.map(t => t.id));
    const exportedStems = new Set(
      pos?.inflectionTables.flatMap(t => t.layout.stems)
    );

    const submittedData: DefinitionData = {
      ...data,
      // Remove inflection tables that belong to a different part of speech.
      inflectionTables: data.inflectionTables.filter(t =>
        availableTables.has(t.tableId)
      ),
      // Remove stems that are not used by any of the inflection tables.
      stems: {
        map: new Map(
          [...data.stems.map].filter(([name]) =>
            exportedStems.has(name)
          )
        ),
      },
    };
    return onSubmit(submittedData);
  }, [partsOfSpeech, onSubmit]);

  const hasPartsOfSpeech = partOfSpeechOptions.length > 0 ? 'yes' : 'no';

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <TextField
          name='term'
          label={<Localized id='definition-term-label'/>}
          aria-required
          validate={{notEmpty}}
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
          validate={{notEmpty: validatePartOfSpeech}}
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
          partsOfSpeech={partsOfSpeech}
          defaultStems={defaultValues.stems}
          onCreateInflectionTable={onCreateInflectionTable}
        />
        <StemsField partsOfSpeech={partsOfSpeech}/>
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

const validatePartOfSpeech = (value: PartOfSpeechValue): boolean =>
  value !== null;
