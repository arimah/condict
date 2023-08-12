import {useState, useCallback, useRef} from 'react';
import {Localized} from '@fluent/react';

import {Button} from '@condict/ui';

import {FlowContent, MainHeader} from '../ui';
import {PanelParams, PanelProps} from '../navigation';
import {FieldData, FieldForm} from '../forms';
import {FieldId} from '../graphql';
import {useData, useExecute, hasData} from '../data';
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

  const data = useData(EditFieldQuery, {id}, ({field}) => {
    if (!field) {
      return null;
    }
    const initialData: FieldData = {
      id: field.id,
      name: field.name,
      nameAbbr: field.nameAbbr,
      partOfSpeechIds:
        field.partsOfSpeech &&
        field.partsOfSpeech.map(pos => pos.id),
      valueType: field.valueType,
      listValues: field.listValues,
    };
    return {
      id: field.id,
      initialData,
      languageId: field.language.id,
      partsOfSpeech: field.language.partsOfSpeech,
    };
  });
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
    if (!hasData(data) || !data.data) {
      return;
    }
    const res = await execute(DeleteFieldMut, {id: data.data.id});
    return res.errors;
  }, [data, execute, onResolve]);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  useRefocusOnData(data, {
    focus: firstFieldRef,
    ownedElem: panelRef,
    preventScroll: entering,
  });

  return (
    <FlowContent>
      <MainHeader>
        <h1 id={titleId}>
          <Localized id='field-edit-title'/>
        </h1>
        {hasData(data) && data.data &&
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
      {renderFormData(data, onResolve, data =>
        data ? (
          <FieldForm
            initialData={data.initialData}
            languageId={data.languageId}
            initialPartsOfSpeech={data.partsOfSpeech}
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
