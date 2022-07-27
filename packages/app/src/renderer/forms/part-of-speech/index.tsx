import {ReactNode, RefObject} from 'react';
import {Localized} from '@fluent/react';

import {FormProvider, useForm} from '../../form';
import {TextField, FormButtons} from '../../form-fields';
import {PartOfSpeechId, LanguageId} from '../../graphql';
import {useExecute} from '../../data';

import {notEmpty, nameNotTaken} from '../validators';
import {useSyncFormDirtiness} from '../utils';

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
    initValue: () => initialData,
  });

  useSyncFormDirtiness(form, onDirtyChange);

  const execute = useExecute();

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextField
          name='name'
          label={<Localized id='part-of-speech-name-label'/>}
          aria-required
          validate={[
            notEmpty,
            nameNotTaken(
              initialData.id,
              name => execute(CheckNameQuery, {lang: languageId, name}),
              data => data.language?.partOfSpeechByName?.id ?? null
            ),
          ]}
          errorMessages={{
            taken: <Localized id='part-of-speech-name-taken-error'/>,
          }}
          defaultError={<Localized id='part-of-speech-name-required-error'/>}
          inputRef={firstFieldRef as RefObject<HTMLInputElement> | undefined}
        />
        <FormButtons submitError={submitError} onCancel={onCancel}/>
      </form>
    </FormProvider>
  );
};
