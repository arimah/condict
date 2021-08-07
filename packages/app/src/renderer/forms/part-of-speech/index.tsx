import {ReactNode, RefObject, useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {Localized} from '@fluent/react';

import {PartOfSpeechId, LanguageId} from '../../graphql';
import {TextField, FormButtons} from '../../ui';
import {useExecute} from '../../data';

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

  // The ID shouldn't change; we can safely get it from initialData.
  const {id} = initialData;

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
            notEmpty: name => /\S/.test(name),
            notTaken: async name => {
              const res = await execute(CheckNameQuery, {
                lang: languageId,
                name: name.trim(),
              });
              if (!res.data || res.errors) {
                // Let validation pass until we try to submit the form.
                if (res.errors) {
                  console.error(
                    'Check language name: GraphQL error:',
                    res.errors
                  );
                }
                return true;
              }

              if (!res.data.language) {
                // The language has been deleted. An error will occur when the
                // form is submitted.
                return true;
              }
              return (
                res.data.language.partOfSpeechByName === null ||
                res.data.language.partOfSpeechByName.id === id
              );
            },
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
