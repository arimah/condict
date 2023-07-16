import {useState, useMemo, useCallback, useRef} from 'react';
import {Localized} from '@fluent/react';

import {Button} from '@condict/ui';

import {FlowContent, MainHeader} from '../ui';
import {PanelParams, PanelProps} from '../navigation';
import {FieldData, FieldForm} from '../forms';
import {FieldId} from '../graphql';
import {useData, useExecute} from '../data';
import {useRefocusOnData} from '../hooks';

import ConfirmDeleteButton from './confirm-delete-button';
import renderFormData from './render-form-data';
import {EditFieldQuery, EditFieldMut, DeleteFieldMut} from './query';

type Props = {
  id: FieldId;
} & PanelProps<void>;

const EditFieldPanel = (props: Props): JSX.Element => {
  const {id, updatePanel, titleId, panelRef, entering, onResolve} = props;

  const execute = useExecute();

  const data = useData(EditFieldQuery, {id});
  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: FieldData) => {
    setSubmitError(false);

    const res = await execute(EditFieldMut, {
      id,
      data: {
        name: formData.name,
        nameAbbr: formData.nameAbbr,
        partOfSpeechIds: formData.partOfSpeechIds ?? [],
        valueType: formData.valueType,
        listValues: formData.listValues,
      },
    });
    if (res.errors) {
      // TODO: Distinguish between different kinds of errors.
      // TODO: Prompt for reauthentication when necessary.
      console.log('Could not edit field:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have an updated field.
    onResolve();
  }, [id, onResolve]);

  const onDelete = useCallback(async () => {
    if (data.state === 'loading' || !data.result.data?.field) {
      return;
    }

    const {field} = data.result.data;
    const res = await execute(DeleteFieldMut, {id: field.id});
    return res.errors;
  }, [data, execute, onResolve]);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  const initialData = useMemo<FieldData | undefined>(() => {
    if (data.state === 'loading' || !data.result.data?.field) {
      return;
    }
    const field = data.result.data.field;
    return {
      id: field.id,
      name: field.name,
      nameAbbr: field.nameAbbr,
      partOfSpeechIds:
        field.partsOfSpeech &&
        field.partsOfSpeech.map(pos => pos.id),
      valueType: field.valueType,
      listValues: field.listValues,
    };
  }, [data]);

  useRefocusOnData(data, {
    focus: firstFieldRef,
    ownedElem: panelRef,
    preventScroll: entering,
  });

  const field = data.state === 'data' && data.result.data?.field;
  return (
    <FlowContent>
      <MainHeader>
        <h1 id={titleId}>
          <Localized id='field-edit-title'/>
        </h1>
        {field &&
          <ConfirmDeleteButton
            canDelete
            description={
              <Localized id='field-delete-confirm' elems={{bold: <strong/>}}>
                <></>
              </Localized>
            }
            confirmLabel={<Localized id='field-delete-button'/>}
            deleteError={<Localized id='field-delete-error'/>}
            onExecuteDelete={onDelete}
            onAfterDelete={onResolve}
          />}
      </MainHeader>
      {renderFormData(data, onResolve, ({field}) =>
        field ? (
          <FieldForm
            languageId={field.language.id}
            initialPartsOfSpeech={field.language.partsOfSpeech}
            initialData={initialData}
            submitError={submitError && <Localized id='field-save-error'/>}
            firstFieldRef={firstFieldRef}
            onSubmit={onSubmit}
            onCancel={onResolve}
            onDirtyChange={dirty => updatePanel({dirty})}
          />
        ) : <>
          <p>
            <Localized id='field-not-found-error'/>
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

export const editFieldPanel = (id: FieldId): PanelParams<void> => ({
  // eslint-disable-next-line react/display-name
  render: props => <EditFieldPanel {...props} id={id}/>,
});
