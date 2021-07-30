import {useState, useCallback} from 'react';
import {Localized, ReactLocalization} from '@fluent/react';

import {descriptionToGraphQLInput} from '@condict/rich-text-editor';

import {FlowContent} from '../../ui';
import {PanelParams, PanelProps, useNavigateTo} from '../../navigation';
import {LanguagePage} from '../../page';
import {LanguageData, LanguageForm} from '../../forms';
import {useExecute} from '../../data';

import {AddLanguageMut} from './query';

const AddLanguagePanel = (props: PanelProps<void>) => {
  const {onResolve} = props;

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
    const lang = res.data!.addLanguage!;
    navigateTo(LanguagePage(lang.id, lang.name), {
      openInNewTab: true,
      openInBackground: false,
    });
    onResolve();
  }, [onResolve, navigateTo]);

  return (
    <FlowContent>
      <h1>
        <Localized id='home-add-language-title'/>
      </h1>
      <LanguageForm
        submitError={submitError && <Localized id='home-add-language-error'/>}
        onSubmit={onSubmit}
        onCancel={onResolve}
      />
    </FlowContent>
  );
};

const addLanguagePanel = (l10n: ReactLocalization): PanelParams<void> => ({
  initialTitle: l10n.getString('home-add-language-title'),
  // eslint-disable-next-line react/display-name
  render: props => <AddLanguagePanel {...props}/>,
});

export default addLanguagePanel;
