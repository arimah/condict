import {useState, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {descriptionToGraphQLInput} from '@condict/rich-text-editor';

import {FlowContent, BlockFields} from '../ui';
import {PanelParams, PanelProps, useNavigateTo} from '../navigation';
import {LanguageData, LanguageForm} from '../forms';
import {useExecute} from '../data';
import {LanguageId} from '../graphql';

import {AddLanguageMut} from './query';

export interface NewLanguage {
  id: LanguageId;
  name: string;
  description: BlockFields[];
}

const AddLanguagePanel = (props: PanelProps<NewLanguage | null>) => {
  const {updatePanel, titleId, onResolve} = props;

  const navigateTo = useNavigateTo();
  const execute = useExecute();

  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: LanguageData) => {
    setSubmitError(false);

    const res = await execute(AddLanguageMut, {
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

    // If there were no errors, we should have a language.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onResolve(res.data!.addLanguage);
  }, [onResolve, navigateTo]);

  return (
    <FlowContent>
      <h1 id={titleId}>
        <Localized id='home-add-language-title'/>
      </h1>
      <LanguageForm
        submitError={submitError && <Localized id='language-save-error'/>}
        onSubmit={onSubmit}
        onCancel={() => onResolve(null)}
        onDirtyChange={dirty => updatePanel({dirty})}
      />
    </FlowContent>
  );
};

export const addLanguagePanel: PanelParams<NewLanguage | null> = {
  // eslint-disable-next-line react/display-name
  render: props => <AddLanguagePanel {...props}/>,
};
