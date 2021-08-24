import {ReactNode, RefObject, useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {Localized} from '@fluent/react';

import {BlockElement, emptyDescription} from '@condict/rich-text-editor';

import {LanguageId} from '../../graphql';
import {TextField, DescriptionField, FormButtons} from '../../form-fields';
import {useExecute} from '../../data';

import {notEmpty, nameNotTaken} from '../validators';

import {CheckNameQuery} from './query';

export type Props = {
  initialData?: LanguageData;
  submitError?: ReactNode;
  firstFieldRef?: RefObject<HTMLElement>;
  onSubmit: (data: LanguageData) => Promise<void> | void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export interface LanguageData {
  id: LanguageId | null;
  name: string;
  description: BlockElement[];
}

const EmptyData: LanguageData = {
  id: null,
  name: '',
  description: emptyDescription(),
};

export const LanguageForm = (props: Props): JSX.Element => {
  const {
    initialData = EmptyData,
    submitError,
    firstFieldRef,
    onSubmit,
    onCancel,
    onDirtyChange,
  } = props;

  const form = useForm<LanguageData>({defaultValues: initialData});

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
          label={<Localized id='language-name-label'/>}
          aria-required
          validate={{
            notEmpty,
            notTaken: nameNotTaken(
              initialData.id,
              name => execute(CheckNameQuery, {name}),
              data => data.languageByName?.id ?? null
            ),
          }}
          errorMessages={{
            notTaken: <Localized id='language-name-taken-error'/>,
          }}
          defaultError={<Localized id='language-name-required-error'/>}
          inputRef={firstFieldRef as RefObject<HTMLInputElement> | undefined}
        />
        <DescriptionField
          name='description'
          label={<Localized id='language-description-label'/>}
        />
        <FormButtons submitError={submitError} onCancel={onCancel}/>
      </form>
    </FormProvider>
  );
};
