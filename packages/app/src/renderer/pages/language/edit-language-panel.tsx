import {useState, useCallback, useMemo, useRef} from 'react';
import {Localized} from '@fluent/react';

import {
  descriptionFromGraphQLResponse,
  descriptionToGraphQLInput,
} from '@condict/rich-text-editor';

import {DataViewer, FlowContent, MainHeader, HeaderAction} from '../../ui';
import {PanelParams, PanelProps} from '../../navigation';
import {LanguageData, LanguageForm} from '../../forms';
import {LanguageId} from '../../graphql';
import {useData, useExecute} from '../../data';
import {useRefocusOnData} from '../../hooks';

import {EditLanguageQuery, EditLanguageMut} from './query';

type Props = {
  id: LanguageId;
} & PanelProps<void>;

const EditLanguagePanel = (props: Props) => {
  const {id, updatePanel, titleId, panelRef, entering, onResolve} = props;

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
      console.log('Could not add language:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have an updated language.
    onResolve();
  }, [id, onResolve]);

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
          // TODO: Make this button do something
          <HeaderAction intent='danger'>
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
          ) : (
            // TODO: Better error message
            // TODO: l10n
            <p>Language not found.</p>
          )
        }
      />
    </FlowContent>
  );
};

const editLanguagePanel = (id: LanguageId): PanelParams<void> => ({
  // eslint-disable-next-line react/display-name
  render: props => <EditLanguagePanel id={id} {...props}/>,
});

export default editLanguagePanel;
