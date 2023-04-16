import {ReactNode, RefObject} from 'react';
import {Localized} from '@fluent/react';
import shallowEqual from 'shallowequal';

import {InflectionTable} from '@condict/table-editor';

import {FormProvider, useForm} from '../../form';
import {TextField, InflectionTableField, FormButtons} from '../../form-fields';
import {InflectionTableId, LanguageId} from '../../graphql';
import {useExecute} from '../../data';

import {notEmpty, nameNotTaken} from '../validators';
import {useSyncFormDirtiness} from '../utils';

import {CheckNameQuery} from './query';

export type Props = {
  languageId: LanguageId;
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
  layout: InflectionTable;
}

const EmptyData: InflectionTableData = {
  id: null,
  name: '',
  layout: InflectionTable.fromJson([
    {
      cells: [{headerText: ''}, {headerText: ''}],
    },
    {
      cells: [
        {headerText: ''},
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
    initialData = EmptyData,
    submitError,
    firstFieldRef,
    onSubmit,
    onCancel,
    onDirtyChange,
  } = props;

  const form = useForm<InflectionTableData>({
    initValue: () => initialData,
    isUnchanged,
  });

  useSyncFormDirtiness(form, onDirtyChange);

  const execute = useExecute();

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextField
          name='name'
          label={<Localized id='inflection-table-name-label'/>}
          aria-required
          validate={[
            notEmpty,
            nameNotTaken(
              initialData.id,
              name => execute(CheckNameQuery, {lang: languageId, name}),
              data => data.language?.inflectionTableByName?.id ?? null
            ),
          ]}
          errorMessages={{
            taken: <Localized id='inflection-table-name-taken-error'/>,
          }}
          defaultError={<Localized id='inflection-table-name-required-error'/>}
          inputRef={firstFieldRef as RefObject<HTMLInputElement> | undefined}
        />
        <InflectionTableField
          name='layout'
          label={<Localized id='inflection-table-layout-label'/>}
          languageId={languageId}
          inflectionTableId={initialData.id}
        />
        <FormButtons submitError={submitError} onCancel={onCancel}/>
      </form>
    </FormProvider>
  );
};

const isUnchanged = (
  current: InflectionTableData,
  initial: InflectionTableData
): boolean =>
  shallowEqual(current, initial, customCompareTableData);

const customCompareTableData = (
  a: any,
  b: any,
  key: string | number | undefined
): boolean | void => {
  if (key === 'layout') {
    const tableA = a as InflectionTable;
    const tableB = b as InflectionTable;
    return (
      tableA.rows === tableB.rows &&
      tableA.cells === tableB.cells &&
      tableA.cellData === tableB.cellData
    );
  }
};
