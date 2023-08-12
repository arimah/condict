import {useState, useCallback, useRef} from 'react';
import {Localized} from '@fluent/react';

import {Button} from '@condict/ui';
import {
  descriptionFromGraphQLResponse,
  descriptionToGraphQLInput,
  tableCaptionFromGraphQLResponse,
  tableCaptionToGraphQLInput,
  emptyTableCaption,
} from '@condict/rich-text-editor';
import {DefinitionTable} from '@condict/table-editor';

import {FlowContent, MainHeader} from '../ui';
import {PanelParams, PanelProps, useOpenPanel} from '../navigation';
import {
  DefinitionData,
  DefinitionTableData,
  DefinitionFieldData,
  DefinitionForm,
} from '../forms';
import {DefinitionId, LanguageId, LemmaId, OperationResult} from '../graphql';
import {useData, useExecute, hasData} from '../data';
import {useRefocusOnData} from '../hooks';

import ConfirmDeleteButton from './confirm-delete-button';
import {addPartOfSpeechPanel} from './add-part-of-speech';
import {addInflectionTablePanel} from './add-inflection-table';
import renderFormData from './render-form-data';
import {
  formatCustomForms,
  formatStems,
  formatFields,
  hasTableCaption,
} from './utils';
import {
  EditDefinitionQuery,
  EditDefinitionMut,
  DeleteDefinitionMut,
} from './query';

export interface EditedDefinition {
  id: DefinitionId;
  term: string;
  lemma: {
    id: LemmaId;
  };
  language: {
    id: LanguageId;
    name: string;
  };
}

type Definition = NonNullable<
  OperationResult<typeof EditDefinitionQuery>['definition']
>;

type DefinitionInflectionTable =
  Definition['inflectionTables'] extends readonly (infer T)[]
    ? T
    : unknown;

type DefinitionFieldValue =
  Definition['fields'] extends readonly (infer T)[]
    ? T
    : unknown;

type Props = {
  id: DefinitionId;
} & PanelProps<EditedDefinition | null>;

const EditDefinitionPanel = (props: Props): JSX.Element => {
  const {id, updatePanel, titleId, panelRef, entering, onResolve} = props;

  const execute = useExecute();

  const data = useData(EditDefinitionQuery, {id}, ({definition: def}) => {
    if (!def) {
      return null;
    }
    const initialData: DefinitionData = {
      id: def.id,
      term: def.term,
      description: descriptionFromGraphQLResponse(def.description),
      partOfSpeech: def.partOfSpeech.id,
      inflectionTables: def.inflectionTables.map(convertInflectionTable),
      stems: new Map(def.stems.map(s => [s.name, s.value])),
      tags: def.tags,
      fields: def.fields.map(convertFieldValue),
    };
    return {
      id: def.id,
      initialData,
      languageId: def.language.id,
      partsOfSpeech: def.language.partsOfSpeech,
      inflectionTables: def.language.inflectionTables,
      customFields: def.language.fields,
    };
  });
  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: DefinitionData) => {
    setSubmitError(false);

    const res = await execute(EditDefinitionMut, {
      id,
      data: {
        term: formData.term,
        description: descriptionToGraphQLInput(formData.description),
        partOfSpeechId: formData.partOfSpeech,
        inflectionTables: formData.inflectionTables.map(table => ({
          id: table.id,
          inflectionTableId: table.tableId,
          customForms: formatCustomForms(table.table),
          caption: hasTableCaption(table.caption)
            ? tableCaptionToGraphQLInput(table.caption)
            : null,
          upgradeTableLayout: table.upgraded,
        })),
        stems: formatStems(formData.stems),
        tags: formData.tags.map(t => t.name),
        fields: formatFields(formData.fields),
      },
    });
    if (res.errors) {
      // TODO: Distinguish between different kinds of errors.
      // TODO: Prompt for reauthentication when necessary.
      console.log('Could not edit definition:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have an updated definition.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onResolve(res.data!.editDefinition);
  }, [id, onResolve]);

  const onDelete = useCallback(async () => {
    if (!hasData(data) || !data.data) {
      return;
    }
    const res = await execute(DeleteDefinitionMut, {id: data.data.id});
    return res.errors;
  }, [data, execute, onResolve]);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  const languageId = hasData(data) && data.data
    ? data.data.languageId
    : null;

  const openPanel = useOpenPanel();

  const createPartOfSpeech = useCallback(() => {
    // It should not be possible to trigger this panel before the language is
    // available.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return openPanel(addPartOfSpeechPanel(languageId!));
  }, [languageId, openPanel]);

  const createInflectionTable = useCallback(() => {
    return openPanel(addInflectionTablePanel({
      // It should not be possible to trigger this panel before the language is
      // available.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      languageId: languageId!,
    }));
  }, [languageId, openPanel]);

  useRefocusOnData(data, {
    focus: firstFieldRef,
    ownedElem: panelRef,
    preventScroll: entering,
  });

  const onClose = () => onResolve(null);

  return (
    <FlowContent>
      <MainHeader>
        <h1 id={titleId}>
          <Localized id='definition-edit-title'/>
        </h1>
        {hasData(data) && data.data &&
          <ConfirmDeleteButton
            canDelete={true}
            description={
              <Localized
                id='definition-delete-confirm'
                elems={{bold: <strong/>}}
              >
                <></>
              </Localized>
            }
            confirmLabel={<Localized id='definition-delete-button'/>}
            deleteError={<Localized id='definition-delete-error'/>}
            onExecuteDelete={onDelete}
            onAfterDelete={onClose}
          />}
      </MainHeader>
      {renderFormData(data, onClose, data =>
        data ? (
          <DefinitionForm
            initialData={data.initialData}
            languageId={data.languageId}
            initialPartsOfSpeech={data.partsOfSpeech}
            initialInflectionTables={data.inflectionTables}
            initialCustomFields={data.customFields}
            submitError={
              submitError && <Localized id='definition-save-error'/>
            }
            firstFieldRef={firstFieldRef}
            onSubmit={onSubmit}
            onCancel={onClose}
            onDirtyChange={dirty => updatePanel({dirty})}
            onCreatePartOfSpeech={createPartOfSpeech}
            onCreateInflectionTable={createInflectionTable}
          />
        ) : <>
          <p>
            <Localized id='definition-not-found-error'/>
          </p>
          <p>
            <Button onClick={onClose}>
              <Localized id='generic-form-cancel'/>
            </Button>
          </p>
        </>
      )}
    </FlowContent>
  );
};

const convertInflectionTable = (
  table: DefinitionInflectionTable
): DefinitionTableData => ({
  id: table.id,
  tableId: table.inflectionTable.id,
  layoutId: table.inflectionTableLayout.id,
  caption: table.caption
    ? tableCaptionFromGraphQLResponse(table.caption)
    : emptyTableCaption(),
  table: DefinitionTable.fromJson(
    table.inflectionTableLayout.rows,
    new Map(table.customForms.map(f => [f.inflectedForm.id, f.value]))
  ),
  stems: table.inflectionTableLayout.stems,
  upgraded: false,
});

const convertFieldValue = (
  value: DefinitionFieldValue
): DefinitionFieldData => {
  switch (value.__typename) {
    case 'DefinitionFieldTrueValue':
      return {
        type: 'boolean',
        fieldId: value.field.id,
        value: true,
      };
    case 'DefinitionFieldListValue':
      return {
        type: 'list',
        fieldId: value.field.id,
        value: value.values.map(v => v.id),
      };
    case 'DefinitionFieldPlainTextValue':
      return {
        type: 'plainText',
        fieldId: value.field.id,
        value: value.value,
      };
  }
};

export const editDefinitionPanel = (
  id: DefinitionId
): PanelParams<EditedDefinition | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <EditDefinitionPanel id={id} {...props}/>,
});
