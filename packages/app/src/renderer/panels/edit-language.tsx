import {useState, useCallback, useMemo, useRef} from 'react';
import {Localized} from '@fluent/react';

import {Button} from '@condict/ui';
import {
  descriptionFromGraphQLResponse,
  descriptionToGraphQLInput,
} from '@condict/rich-text-editor';

import {DataViewer, FlowContent, MainHeader, HeaderAction} from '../ui';
import {PanelParams, PanelProps, useOpenPanel} from '../navigation';
import {LanguageData, LanguageForm} from '../forms';
import {LanguageId} from '../graphql';
import {useData, useExecute} from '../data';
import {useRefocusOnData} from '../hooks';

import {deleteLanguagePanel} from './delete-language';
import {EditLanguageQuery, EditLanguageMut} from './query';

type Props = {
  id: LanguageId;
} & PanelProps<void>;

const EditLanguagePanel = (props: Props) => {
  const {id, updatePanel, titleId, panelRef, entering, onResolve} = props;

  const openPanel = useOpenPanel();
  const execute = useExecute();

  const data = useData(EditLanguageQuery, {id});
  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: LanguageData) => {
    setSubmitError(false);

    const res = await execute(EditLanguageMut, {
      id,
      data: {
        name: formData.name,
        description: descriptionToGraphQLInput(formData.description),
      },
    });
    if (res.errors) {
      // TODO: Distinguish between different kinds of errors.
      // TODO: Prompt for reauthentication when necessary.
      console.log('Could not edit language:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have an updated language.
    onResolve();
  }, [id, onResolve]);

  const onDelete = useCallback(() => {
    if (data.state === 'loading' || !data.result.data?.language) {
      return;
    }

    const {language} = data.result.data;
    void openPanel(deleteLanguagePanel(
      language.id,
      language.statistics
    )).then(deleted => {
      if (deleted) {
        onResolve();
      }
    });
  }, [id, data, onResolve]);

  const description = useMemo(() => {
    if (data.state === 'loading' || !data.result.data?.language) {
      return [];
    }
    return descriptionFromGraphQLResponse(
      data.result.data.language.description
    );
  }, [data]);

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
          <Localized id='language-edit-title'/>
        </h1>
        {data.state === 'data' && data.result.data?.language &&
          <HeaderAction intent='danger' onClick={onDelete}>
            <Localized id='generic-delete-button'/>
          </HeaderAction>}
      </MainHeader>
      <DataViewer
        result={data}
        render={({language}) =>
          language ? (
            <LanguageForm
              initialData={{
                id: language.id,
                name: language.name,
                description,
              }}
              submitError={submitError && <Localized id='language-save-error'/>}
              firstFieldRef={firstFieldRef}
              onSubmit={onSubmit}
              onCancel={onResolve}
              onDirtyChange={dirty => updatePanel({dirty})}
            />
          ) : <>
            <p>
              <Localized id='language-not-found-error'/>
            </p>
            <p>
              <Button onClick={() => onResolve()}>
                <Localized id='generic-form-cancel'/>
              </Button>
            </p>
          </>
        }
      />
    </FlowContent>
  );
};

export const editLanguagePanel = (id: LanguageId): PanelParams<void> => ({
  // eslint-disable-next-line react/display-name
  render: props => <EditLanguagePanel id={id} {...props}/>,
});
