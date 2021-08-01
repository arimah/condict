import {useState, useCallback, useMemo} from 'react';
import {Localized, ReactLocalization} from '@fluent/react';

import {
  descriptionFromGraphQLResponse,
  descriptionToGraphQLInput,
} from '@condict/rich-text-editor';

import {DataViewer, FlowContent} from '../../ui';
import {PanelParams, PanelProps} from '../../navigation';
import {LanguageData, LanguageForm} from '../../forms';
import {LanguageId} from '../../graphql';
import {useData, useExecute} from '../../data';

import {EditLanguageQuery, EditLanguageMut} from './query';

type Props = {
  id: LanguageId;
} & PanelProps<void>;

const EditLanguagePanel = (props: Props) => {
  const {id, updatePanel, onResolve} = props;

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

  return (
    <FlowContent>
      <h1>
        <Localized id='language-edit-title'/>
      </h1>
      <DataViewer
        result={data}
        render={({language}) =>
          language ? (
            <LanguageForm
              initialData={{
                ...language,
                description,
              }}
              submitError={submitError && <Localized id='language-save-error'/>}
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

const editLanguagePanel = (
  id: LanguageId,
  l10n: ReactLocalization
): PanelParams<void> => ({
  initialTitle: l10n.getString('home-add-language-title'),
  // eslint-disable-next-line react/display-name
  render: props => <EditLanguagePanel id={id} {...props}/>,
});

export default editLanguagePanel;
