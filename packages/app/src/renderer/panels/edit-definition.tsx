import {useState, useMemo, useCallback, useRef} from 'react';
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
import {DefinitionData, DefinitionForm} from '../forms';
import {DefinitionId, LanguageId, LemmaId, PartOfSpeechId} from '../graphql';
import {useData, useExecute} from '../data';
import {useRefocusOnData} from '../hooks';

import ConfirmDeleteButton from './confirm-delete-button';
import {addPartOfSpeechPanel} from './add-part-of-speech';
import {addInflectionTablePanel} from './add-inflection-table';
import renderFormData from './render-form-data';
import {formatCustomForms, formatStems, hasTableCaption} from './utils';
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

type Props = {
  id: DefinitionId;
} & PanelProps<EditedDefinition | null>;

const EditDefinitionPanel = (props: Props): JSX.Element => {
  const {id, updatePanel, titleId, panelRef, entering, onResolve} = props;

  const execute = useExecute();

  const data = useData(EditDefinitionQuery, {id});
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
        tags: formData.tags,
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
    if (data.state === 'loading' || !data.result.data?.definition) {
      return;
    }

    const {definition} = data.result.data;
    const res = await execute(DeleteDefinitionMut, {id: definition.id});
    return res.errors;
  }, [data, execute, onResolve]);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  const languageId = useMemo(() => {
    if (data.state === 'loading' || !data.result.data?.definition?.language) {
      return null;
    }
    return data.result.data.definition.language.id;
  }, [data]);

  const openPanel = useOpenPanel();

  const createPartOfSpeech = useCallback(() => {
    // It should not be possible to trigger this panel before the language is
    // available.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return openPanel(addPartOfSpeechPanel(languageId!));
  }, [languageId, openPanel]);

  const createInflectionTable = useCallback((
    partOfSpeechId: PartOfSpeechId
  ) => {
    return openPanel(addInflectionTablePanel({
      // It should not be possible to trigger this panel before the language is
      // available.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      languageId: languageId!,
      partOfSpeechId,
    }));
  }, [languageId, openPanel]);

  const initialData = useMemo<DefinitionData | undefined>(() => {
    if (data.state === 'loading' || !data.result.data?.definition) {
      return undefined;
    }

    const def = data.result.data.definition;
    return {
      id: def.id,
      term: def.term,
      description: descriptionFromGraphQLResponse(def.description),
      partOfSpeech: def.partOfSpeech.id,
      inflectionTables: def.inflectionTables.map(t => ({
        id: t.id,
        tableId: t.inflectionTable.id,
        layoutId: t.inflectionTableLayout.id,
        caption: t.caption
          ? tableCaptionFromGraphQLResponse(t.caption)
          : emptyTableCaption(),
        table: DefinitionTable.fromJson(
          t.inflectionTableLayout.rows,
          new Map(t.customForms.map(f => [f.inflectedForm.id, f.value]))
        ),
        stems: t.inflectionTableLayout.stems,
        upgraded: false,
      })),
      stems: new Map(def.stems.map(s => [s.name, s.value])),
      tags: def.tags.map(t => t.name),
    };
  }, [data]);

  useRefocusOnData(data, {
    focus: firstFieldRef,
    ownedElem: panelRef,
    preventScroll: entering,
  });

  const onClose = () => onResolve(null);

  const def = data.state === 'data' && data.result.data?.definition;
  return (
    <FlowContent>
      <MainHeader>
        <h1 id={titleId}>
          <Localized id='definition-edit-title'/>
        </h1>
        {def &&
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
      {renderFormData(data, onClose, ({definition: def}) =>
        def ? (
          <DefinitionForm
            initialData={initialData}
            languageId={def.language.id}
            initialPartsOfSpeech={def.language.partsOfSpeech}
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

export const editDefinitionPanel = (
  id: DefinitionId
): PanelParams<EditedDefinition | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <EditDefinitionPanel id={id} {...props}/>,
});
