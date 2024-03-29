import {useState, useCallback, useMemo, useRef} from 'react';
import {Localized} from '@fluent/react';

import {Button} from '@condict/ui';
import {
  descriptionFromGraphQLResponse,
  descriptionToGraphQLInput,
} from '@condict/rich-text-editor';

import {FlowContent, MainHeader} from '../ui';
import {PanelParams, PanelProps} from '../navigation';
import {PartOfSpeechData, PartOfSpeechForm} from '../forms';
import {PartOfSpeechId} from '../graphql';
import {useData, useExecute, hasData} from '../data';
import {useRefocusOnData} from '../hooks';

import ConfirmDeleteButton from './confirm-delete-button';
import renderFormData from './render-form-data';
import {
  EditPartOfSpeechQuery,
  EditPartOfSpeechMut,
  DeletePartOfSpeechMut,
} from './query';

type Props = {
  id: PartOfSpeechId;
} & PanelProps<void>;

const EditPartOfSpeechPanel = (props: Props) => {
  const {id, updatePanel, titleId, panelRef, entering, onResolve} = props;

  const execute = useExecute();

  const data = useData(EditPartOfSpeechQuery, {id}, ({partOfSpeech: pos}) => {
    if (!pos) {
      return null;
    }
    const initialData: PartOfSpeechData = {
      id: pos.id,
      name: pos.name,
      description: descriptionFromGraphQLResponse(pos.description),
    };
    return {
      id: pos.id,
      initialData,
      languageId: pos.language.id,
      isInUse: pos.isInUse,
      usedByDefinitions: pos.usedByDefinitions,
    };
  });
  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: PartOfSpeechData) => {
    setSubmitError(false);

    const res = await execute(EditPartOfSpeechMut, {
      id,
      data: {
        name: formData.name,
        description: descriptionToGraphQLInput(formData.description),
      },
    });
    if (res.errors) {
      // TODO: Distinguish between different kinds of errors.
      // TODO: Prompt for reauthentication when necessary.
      console.log('Could not edit part of speech:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have an updated part of speech.
    onResolve();
  }, [id, onResolve]);

  const onDelete = useCallback(async () => {
    if (!hasData(data) || !data.data) {
      return;
    }
    const res = await execute(DeletePartOfSpeechMut, {id: data.data.id});
    return res.errors;
  }, [data, execute, onResolve]);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  useRefocusOnData(data, {
    focus: firstFieldRef,
    ownedElem: panelRef,
    preventScroll: entering,
  });

  const pos = hasData(data) && data.data;
  return (
    <FlowContent>
      <MainHeader>
        <h1 id={titleId}>
          <Localized id='part-of-speech-edit-title'/>
        </h1>
        {pos &&
          <ConfirmDeleteButton
            canDelete={!pos.isInUse}
            description={
              <Localized
                id={
                  pos.isInUse
                    ? 'part-of-speech-delete-not-possible'
                    : 'part-of-speech-delete-confirm'
                }
                vars={{definitionCount: pos.usedByDefinitions.page.totalCount}}
                elems={{bold: <strong/>}}
              >
                <></>
              </Localized>
            }
            confirmLabel={<Localized id='part-of-speech-delete-button'/>}
            deleteError={<Localized id='part-of-speech-delete-error'/>}
            onExecuteDelete={onDelete}
            onAfterDelete={onResolve}
          />}
      </MainHeader>
      {renderFormData(data, onResolve, data =>
        data ? (
          <PartOfSpeechForm
            initialData={data.initialData}
            languageId={data.languageId}
            submitError={submitError && <Localized id='part-of-speech-save-error'/>}
            firstFieldRef={firstFieldRef}
            onSubmit={onSubmit}
            onCancel={onResolve}
            onDirtyChange={dirty => updatePanel({dirty})}
          />
        ) : <>
          <p>
            <Localized id='part-of-speech-not-found-error'/>
          </p>
          <p>
            <Button onClick={() => onResolve()}>
              <Localized id='generic-form-cancel'/>
            </Button>
          </p>
        </>
      )}
    </FlowContent>
  );
};

export const editPartOfSpeechPanel = (
  id: PartOfSpeechId
): PanelParams<void> => ({
  // eslint-disable-next-line react/display-name
  render: props => <EditPartOfSpeechPanel id={id} {...props}/>,
});
