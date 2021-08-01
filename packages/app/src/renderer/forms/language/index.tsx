import {ReactNode, useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {Localized} from '@fluent/react';

import {BlockElement, emptyDescription} from '@condict/rich-text-editor';

import {LanguageId} from '../../graphql';
import {TextField, DescriptionField, FormButtons} from '../../ui';
import {useExecute} from '../../data';

import {CheckNameQuery} from './query';

export type Props = {
  initialData?: LanguageData;
  submitError?: ReactNode;
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
    onSubmit,
    onCancel,
    onDirtyChange,
  } = props;

  // The ID shouldn't change; we can safely get it from initialData.
  const {id} = initialData;

  const form = useForm<LanguageData>({
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
          label={<Localized id='language-name-label'/>}
          validate={{
            notEmpty: name => /\S/.test(name),
            notTaken: async name => {
              const res = await execute(CheckNameQuery, {name: name.trim()});
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
              return (
                res.data.languageByName === null ||
                res.data.languageByName.id === id
              );
            },
          }}
          errorMessages={{
            notTaken: <Localized id='language-name-taken-error'/>,
          }}
          defaultError={<Localized id='language-name-required-error'/>}
          required
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
