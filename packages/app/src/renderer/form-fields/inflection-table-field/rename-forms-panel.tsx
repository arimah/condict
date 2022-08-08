import React, {useMemo, useCallback, useRef, useEffect} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import DefaultNameIcon from 'mdi-react/LinkBoxVariantOutlineIcon';
import CustomNameIcon from 'mdi-react/PencilBoxIcon';

import {TextInput, SROnly, useUniqueId} from '@condict/ui';
import {
  InflectionPattern,
  InflectionTable,
  Layout,
  Table,
} from '@condict/table-editor';

import {Form, FormProvider, useForm, useField} from '../../form';
import {PanelParams, PanelProps} from '../../navigation';
import {FlowContent, MainHeader} from '../../ui';

import {FormButtons} from '../form-buttons';

import * as S from './styles';

type Props = {
  initialValue: InflectionTable;
} & PanelProps<InflectionTable |  null>;

interface InflectedForm {
  readonly cellKey: string;
  readonly row: number;
  readonly column: number;
  readonly inflectionPattern: string;
  readonly initialName: string;
  readonly derivedName: string;
  readonly hasCustomName: boolean;
}

type FormData = Record<string, InflectedFormData>;

interface InflectedFormData {
  readonly value: string;
  readonly isCustom: boolean;
}

const RenameFormsPanel = (props: Props): JSX.Element => {
  const {initialValue, titleId, updatePanel, onResolve} = props;

  const id = useUniqueId();

  const inflectedForms = useMemo(() => {
    const derivedNames = InflectionTable.deriveAllNames(initialValue);

    const forms: InflectedForm[] = [];
    for (const cell of initialValue.cells.values()) {
      if (!cell.header) {
        const data = Table.getData(initialValue, cell.key);
        const layoutCell = Layout.getCellByKey(initialValue.layout, cell.key);
        forms.push({
          cellKey: cell.key,
          row: layoutCell.homeRow,
          column: layoutCell.homeColumn,
          inflectionPattern: data.text,
          initialName: data.displayName,
          derivedName: Table.getData(derivedNames, cell.key).displayName,
          hasCustomName: data.hasCustomDisplayName,
        });
      }
    }

    // Sort by table position; the `cells` map is not guaranteed to be
    // in any particular order.
    forms.sort((a, b) => a.row - b.row || a.column - b.column);
    return forms;
  }, [initialValue]);

  const form = useForm<FormData>({
    initValue: () => inflectedForms.reduce((names, f) => {
      names[f.cellKey] = {
        // Derived names are not calculated in real-time as the user edits,
        // so the current display name of the cell may be out of date if the
        // nearby headings have changed. For cells that have no custom name,
        // we should always use `derivedName`, which is up to date.
        value: f.hasCustomName ? f.initialName : f.derivedName,
        isCustom: f.hasCustomName,
      };
      return names;
    }, {} as Record<string, InflectedFormData>),
    isUnchanged,
  });

  useEffect(() => form.watchState(() => {
    updatePanel({dirty: form.state.isDirty});
  }), []);

  const handleSubmit = useCallback((data: FormData): void => {
    const table = Table.update(initialValue, draft => {
      for (const key in data) {
        const newCellData = data[key];

        Table.updateData(draft, key, cellData => {
          cellData.displayName = newCellData.value;
          cellData.hasCustomDisplayName = newCellData.isCustom;
        });
      }
    });
    onResolve(table);
  }, [onResolve]);

  return (
    <FlowContent>
      <MainHeader>
        <h1 id={titleId}>
          <Localized id='table-editor-rename-forms-title'/>
        </h1>
      </MainHeader>
      <FormProvider form={form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <S.InflectedFormList>
            {inflectedForms.map(inflectedForm =>
              <InflectedFormField
                key={inflectedForm.cellKey}
                id={`${id}-${inflectedForm.cellKey}`}
                form={form}
                cellKey={inflectedForm.cellKey}
                inflectedForm={inflectedForm}
              />
            )}
          </S.InflectedFormList>

          <FormButtons onCancel={() => onResolve(null)}/>
        </form>
      </FormProvider>
    </FlowContent>
  );
};

const renameFormsPanel = (
  initialValue: InflectionTable
): PanelParams<InflectionTable | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <RenameFormsPanel {...props} initialValue={initialValue}/>,
});

export default renameFormsPanel;

const isUnchanged = (current: FormData, initial: FormData) => {
  // The two values are guaranteed to contain the same keys, as we never add
  // or remove inflected forms, and there are no unexpected extra properties.
  // Hence, we can just use a for-in loop here.
  for (const key in initial) {
    const currentField = current[key];
    const initialField = initial[key];
    if (
      currentField.value !== initialField.value ||
      currentField.isCustom !== initialField.isCustom
    ) {
      return false;
    }
  }
  return true;
};

type InflectedFormFieldProps = {
  id: string;
  form: Form<FormData>;
  cellKey: string;
  inflectedForm: InflectedForm;
};

const InflectedFormField = React.memo((
  props: InflectedFormFieldProps
): JSX.Element => {
  const {id, cellKey, form, inflectedForm} = props;

  const {l10n} = useLocalization();

  const inputRef = useRef<HTMLInputElement>(null);
  const field = useField<InflectedFormData>(form, cellKey, {
    focus: () => inputRef.current?.focus(),
  });

  const {value, isCustom} = field.value;

  return (
    <li>
      <S.InflectedFormInput>
        <S.InflectedFormLabel>
          <label htmlFor={id}>
            {/\S/.test(inflectedForm.inflectionPattern) ? (
              <InflectionPattern pattern={inflectedForm.inflectionPattern}/>
            ) : (
              <i>
                <Localized id='table-editor-empty-form-label'/>
              </i>
            )}
          </label>
          <span
            id={`${id}-desc`}
            title={l10n.getString('table-editor-derived-name-label-tooltip')}
          >
            <SROnly>
              <Localized id='table-editor-derived-name-label'/>
            </SROnly>
            {' '}
            {inflectedForm.derivedName}
          </span>
        </S.InflectedFormLabel>
        <TextInput
          id={id}
          value={value}
          aria-describedby={`${id}-status ${id}-desc`}
          onChange={e => field.set({
            value: e.target.value,
            isCustom: true,
          })}
          ref={inputRef}
        />
        <SROnly id={`${id}-status`}>
          <Localized
            id={
              isCustom
                ? 'table-editor-custom-name-status'
                : 'table-editor-derived-name-status'
            }
          />
        </SROnly>
      </S.InflectedFormInput>
      <S.InflectedFormAction
        label={l10n.getString('table-editor-name-source-label')}
        /*
         * The button's SR label is 'Use automatic term', so we should announce
         * it as pressed when the form does *not* have a custom display name.
         */
        aria-pressed={!isCustom}
        hasCustomName={isCustom}
        title={l10n.getString(
          isCustom
            ? 'table-editor-custom-name-tooltip'
            : 'table-editor-derived-name-tooltip'
        )}
        onClick={() => field.set({
          // If we're going from custom to derived name, we'll want to reset it
          // to the derived name. If we're going the other way, it's already set
          // to the derived name, and nothing changes.
          value: inflectedForm.derivedName,
          isCustom: !isCustom,
        })}
      >
        {isCustom ? <CustomNameIcon/> : <DefaultNameIcon/>}
      </S.InflectedFormAction>
    </li>
  );
});

InflectedFormField.displayName = 'InflectedFormField';
