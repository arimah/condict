import {useState, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {descriptionToGraphQLInput} from '@condict/rich-text-editor';

import {FlowContent} from '../ui';
import {PanelParams, PanelProps} from '../navigation';
import {PartOfSpeechData, PartOfSpeechForm} from '../forms';
import {useExecute} from '../data';
import {PartOfSpeechId, LanguageId} from '../graphql';

import {AddPartOfSpeechMut} from './query';

export interface NewPartOfSpeech {
  id: PartOfSpeechId;
  name: string;
  language: {
    id: LanguageId;
    name: string;
  };
}

type Props = {
  languageId: LanguageId;
} & PanelProps<NewPartOfSpeech | null>;

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
        description: descriptionToGraphQLInput(formData.description),
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
    onResolve(res.data!.addPartOfSpeech);
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
): PanelParams<NewPartOfSpeech | null> => ({
  // eslint-disable-next-line react/display-name
  render: props => <AddPartOfSpeechPanel {...props} languageId={languageId}/>,
});
