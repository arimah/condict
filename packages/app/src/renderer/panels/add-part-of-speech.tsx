import {useState, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {FlowContent} from '../ui';
import {PanelParams, PanelProps} from '../navigation';
import {PartOfSpeechPage, LanguagePage} from '../page';
import {PartOfSpeechData, PartOfSpeechForm} from '../forms';
import {useExecute} from '../data';
import {LanguageId} from '../graphql';

import {AddPartOfSpeechMut} from './query';

type Props = {
  languageId: LanguageId;
} & PanelProps<PartOfSpeechPage | null>;

const AddPartOfSpeechPanel = (props: Props) => {
  const {languageId, updatePanel, titleId, onResolve} = props;

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
    onResolve(PartOfSpeechPage(pos.id, pos.name, lang));
  }, [languageId, onResolve]);

  return (
    <FlowContent>
      <h1 id={titleId}>
        <Localized id='language-add-part-of-speech-title'/>
      </h1>
      <PartOfSpeechForm
        languageId={languageId}
        submitError={submitError && <Localized id='part-of-speech-save-error'/>}
        onSubmit={onSubmit}
        onCancel={() => onResolve(null)}
        onDirtyChange={dirty => updatePanel({dirty})}
      />
    </FlowContent>
  );
};

export const addPartOfSpeechPanel = (
  languageId: LanguageId
): PanelParams<PartOfSpeechPage | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <AddPartOfSpeechPanel {...props} languageId={languageId}/>,
});
