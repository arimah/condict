import {useState, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {FlowContent} from '../../ui';
import {PanelParams, PanelProps, useNavigateTo} from '../../navigation';
import {PartOfSpeechPage, LanguagePage} from '../../page';
import {PartOfSpeechData, PartOfSpeechForm} from '../../forms';
import {useExecute} from '../../data';

import {AddPartOfSpeechMut} from './query';

import {LanguageId} from '../../graphql';

type Props = {
  languageId: LanguageId;
} & PanelProps<void>;

const AddLanguagePanel = (props: Props) => {
  const {languageId, updatePanel, titleId, onResolve} = props;

  const navigateTo = useNavigateTo();
  const execute = useExecute();

  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: PartOfSpeechData) => {
    setSubmitError(false);

    const res = await execute(AddPartOfSpeechMut, {
      data: {
        languageId,
        name: formData.name,
      },
    });
    if (res.errors) {
      // TODO: Distinguish between different kinds of errors.
      // TODO: Prompt for reauthentication when necessary.
      console.log('Could not add part of speech:', res.errors);
      setSubmitError(true);
      return;
    }

    // If there were no errors, we should have a part of speech.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pos = res.data!.addPartOfSpeech!;
    const lang = LanguagePage(pos.language.id, pos.language.name);
    navigateTo(PartOfSpeechPage(pos.id, pos.name, lang), {
      openInNewTab: true,
      openInBackground: false,
    });
    onResolve();
  }, [languageId, onResolve, navigateTo]);

  return (
    <FlowContent>
      <h1 id={titleId}>
        <Localized id='language-add-part-of-speech-title'/>
      </h1>
      <PartOfSpeechForm
        languageId={languageId}
        submitError={submitError && <Localized id='part-of-speech-save-error'/>}
        onSubmit={onSubmit}
        onCancel={onResolve}
        onDirtyChange={dirty => updatePanel({dirty})}
      />
    </FlowContent>
  );
};

const addLanguagePanel = (languageId: LanguageId): PanelParams<void> => ({
  // eslint-disable-next-line react/display-name
  render: props => <AddLanguagePanel {...props} languageId={languageId}/>,
});

export default addLanguagePanel;
