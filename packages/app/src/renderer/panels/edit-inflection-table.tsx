import {useState, useMemo, useCallback, useRef} from 'react';
import {Localized} from '@fluent/react';

import {Button} from '@condict/ui';
import {InflectionTable} from '@condict/table-editor';

import {FlowContent, MainHeader, renderData} from '../ui';
import {PanelParams, PanelProps} from '../navigation';
import {InflectionTableData, InflectionTableForm} from '../forms';
import {InflectionTableId, InflectionTableRowInput} from '../graphql';
import {useData, useExecute} from '../data';
import {useRefocusOnData} from '../hooks';

import ConfirmDeleteButton from './confirm-delete-button';
import {
  EditInflectionTableQuery,
  EditInflectionTableMut,
  DeleteInflectionTableMut,
} from './query';

type Props = {
  id: InflectionTableId;
} & PanelProps<void>;

const EditInflectionTablePanel = (props: Props) => {
  const {id, updatePanel, titleId, panelRef, entering, onResolve} = props;

  const execute = useExecute();

  const data = useData(EditInflectionTableQuery, {id});
  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: InflectionTableData) => {
    setSubmitError(false);

    const res = await execute(EditInflectionTableMut, {
      id,
      data: {
        name: formData.name,
        layout:
          InflectionTable.export(formData.layout) as
            InflectionTableRowInput[],
      },
    });
    if (res.errors) {
      // TODO: Distinguish between different kinds of errors.
      // TODO: Prompt for reauthentication when necessary.
      console.log('Could not edit inflection table:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have an updated inflection table.
    onResolve();
  }, [id, onResolve]);

  const onDelete = useCallback(async () => {
    if (data.state === 'loading' || !data.result.data?.inflectionTable) {
      return;
    }

    const {inflectionTable} = data.result.data;
    const res = await execute(DeleteInflectionTableMut, {id: inflectionTable.id});
    return res.errors;
  }, [data, execute, onResolve]);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  const layout = useMemo(() => {
    if (data.state === 'loading' || !data.result.data?.inflectionTable) {
      return null;
    }
    return InflectionTable.fromJson(
      data.result.data.inflectionTable.layout.rows
    );
  }, [data]);

  useRefocusOnData(data, {
    focus: firstFieldRef,
    ownedElem: panelRef,
    preventScroll: entering,
  });

  const table = data.state === 'data' && data.result.data?.inflectionTable;
  return (
    <FlowContent>
      <MainHeader>
        <h1 id={titleId}>
          <Localized id='inflection-table-edit-title'/>
        </h1>
        {table &&
          <ConfirmDeleteButton
            canDelete={!table.isInUse}
            description={
              <Localized
                id={
                  table.isInUse
                    ? 'inflection-table-delete-not-possible'
                    : 'inflection-table-delete-confirm'
                }
                vars={{definitionCount: table.usedByDefinitions.page.totalCount}}
                elems={{bold: <strong/>}}
              >
                <></>
              </Localized>
            }
            confirmLabel={<Localized id='inflection-table-delete-button'/>}
            deleteError={<Localized id='inflection-table-delete-error'/>}
            onExecuteDelete={onDelete}
            onAfterDelete={onResolve}
          />}
      </MainHeader>
      {renderData(data, ({inflectionTable: table}) =>
        table ? (
          <InflectionTableForm
            initialData={{
              id: table.id,
              name: table.name,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              layout: layout!,
            }}
            languageId={table.partOfSpeech.language.id}
            partOfSpeechId={table.partOfSpeech.id}
            submitError={
              submitError && <Localized id='inflection-table-save-error'/>
            }
            firstFieldRef={firstFieldRef}
            onSubmit={onSubmit}
            onCancel={onResolve}
            onDirtyChange={dirty => updatePanel({dirty})}
          />
        ) : <>
          <p>
            <Localized id='inflection-table-not-found-error'/>
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

export const editInflectionTablePanel = (
  id: InflectionTableId
): PanelParams<void> => ({
  // eslint-disable-next-line react/display-name
  render: props => <EditInflectionTablePanel id={id} {...props}/>,
});
