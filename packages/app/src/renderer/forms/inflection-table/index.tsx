import {ReactNode, RefObject, useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {Localized} from '@fluent/react';

import {InflectionTableId, LanguageId, PartOfSpeechId} from '../../graphql';
import {
  TextField,
  InflectionTableField,
  InflectionTableValue,
  FormButtons,
} from '../../form-fields';
import {useExecute} from '../../data';

import {notEmpty, nameNotTaken} from '../validators';

import {CheckNameQuery} from './query';

export type Props = {
  languageId: LanguageId;
  partOfSpeechId: PartOfSpeechId;
  initialData?: InflectionTableData;
  submitError?: ReactNode;
  firstFieldRef?: RefObject<HTMLElement>;
  onSubmit: (data: InflectionTableData) => Promise<void> | void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export interface InflectionTableData {
  id: InflectionTableId | null;
  name: string;
  layout: InflectionTableValue;
}

const EmptyData: InflectionTableData = {
  id: null,
  name: '',
  layout: InflectionTableValue.fromGraphQLResponse([
    {
      cells: [
        {
          headerText: '',
        },
        {
          headerText: '',
        },
      ],
    },
    {
      cells: [
        {
          headerText: '',
        },
        {
          inflectedForm: {
            id: null,
            inflectionPattern: '',
            deriveLemma: true,
            displayName: '',
            hasCustomDisplayName: false,
          },
        },
      ],
    },
  ]),
};

export const InflectionTableForm = (props: Props): JSX.Element => {
  const {
    languageId,
    partOfSpeechId,
    initialData = EmptyData,
    submitError,
    firstFieldRef,
    onSubmit,
    onCancel,
    onDirtyChange,
  } = props;

  const form = useForm<InflectionTableData>({
    mode: 'onTouched',
    defaultValues: initialData,
  });

  const {isDirty} = form.formState;
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty]);

  const execute = useExecute();

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextField
          name='name'
          label={<Localized id='inflection-table-name-label'/>}
          validate={{
            notEmpty,
            notTaken: nameNotTaken(
              initialData.id,
              name => execute(CheckNameQuery, {pos: partOfSpeechId, name}),
              data => data.partOfSpeech?.inflectionTableByName?.id ?? null
            ),
          }}
          errorMessages={{
            notTaken: <Localized id='inflection-table-name-taken-error'/>,
          }}
          defaultError={<Localized id='inflection-table-name-required-error'/>}
          required
          inputRef={firstFieldRef as RefObject<HTMLInputElement> | undefined}
        />
        <InflectionTableField
          name='layout'
          label={<Localized id='inflection-table-layout-label'/>}
          languageId={languageId}
          partOfSpeechId={partOfSpeechId}
          inflectionTableId={initialData.id}
        />
        <FormButtons submitError={submitError} onCancel={onCancel}/>
      </form>
    </FormProvider>
  );
};
