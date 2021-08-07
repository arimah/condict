import {ReactNode, RefObject, useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {Localized} from '@fluent/react';

import {PartOfSpeechId, LanguageId} from '../../graphql';
import {TextField, FormButtons} from '../../ui';
import {useExecute} from '../../data';

import {notEmpty, nameNotTaken} from '../validators';

import {CheckNameQuery} from './query';

export type Props = {
  languageId: LanguageId;
  initialData?: PartOfSpeechData;
  submitError?: ReactNode;
  firstFieldRef?: RefObject<HTMLElement>;
  onSubmit: (data: PartOfSpeechData) => Promise<void> | void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export interface PartOfSpeechData {
  id: PartOfSpeechId | null;
  name: string;
}

const EmptyData: PartOfSpeechData = {
  id: null,
  name: '',
};

export const PartOfSpeechForm = (props: Props): JSX.Element => {
  const {
    languageId,
    initialData = EmptyData,
    submitError,
    firstFieldRef,
    onSubmit,
    onCancel,
    onDirtyChange,
  } = props;

  const form = useForm<PartOfSpeechData>({
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
          label={<Localized id='part-of-speech-name-label'/>}
          validate={{
            notEmpty,
            notTaken: nameNotTaken(
              initialData.id,
              name => execute(CheckNameQuery, {lang: languageId, name}),
              data => data.language?.partOfSpeechByName?.id ?? null
            ),
          }}
          errorMessages={{
            notTaken: <Localized id='part-of-speech-name-taken-error'/>,
          }}
          defaultError={<Localized id='part-of-speech-name-required-error'/>}
          required
          inputRef={firstFieldRef as RefObject<HTMLInputElement> | undefined}
        />
        <FormButtons submitError={submitError} onCancel={onCancel}/>
      </form>
    </FormProvider>
  );
};
