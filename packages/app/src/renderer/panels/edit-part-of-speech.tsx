import {useState, useCallback, useRef} from 'react';
import {Localized} from '@fluent/react';

import {Button} from '@condict/ui';

import {DataViewer, FlowContent, MainHeader, HeaderAction} from '../ui';
import {PanelParams, PanelProps, useOpenPanel} from '../navigation';
import {PartOfSpeechData, PartOfSpeechForm} from '../forms';
import {PartOfSpeechId} from '../graphql';
import {useData, useExecute} from '../data';
import {useRefocusOnData} from '../hooks';

import {EditPartOfSpeechQuery, EditPartOfSpeechMut} from './query';

type Props = {
  id: PartOfSpeechId;
} & PanelProps<void>;

const EditPartOfSpeechPanel = (props: Props) => {
  const {id, updatePanel, titleId, panelRef, entering, onResolve} = props;

  // const openPanel = useOpenPanel();
  const execute = useExecute();

  const data = useData(EditPartOfSpeechQuery, {id});
  const [submitError, setSubmitError] = useState(false);

  const onSubmit = useCallback(async (formData: PartOfSpeechData) => {
    setSubmitError(false);

    const res = await execute(EditPartOfSpeechMut, {
      id,
      data: {name: formData.name},
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
    if (data.state === 'loading' || !data.result.data?.partOfSpeech) {
      return;
    }

    const {partOfSpeech} = data.result.data;
    // TODO
  }, [id, data, onResolve]);

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
          <Localized id='part-of-speech-edit-title'/>
        </h1>
        {data.state === 'data' && data.result.data?.partOfSpeech &&
          <HeaderAction intent='danger' onClick={onDelete}>
            <Localized id='generic-delete-button'/>
          </HeaderAction>}
      </MainHeader>
      <DataViewer
        result={data}
        render={({partOfSpeech}) =>
          partOfSpeech ? (
            <PartOfSpeechForm
              initialData={{
                id: partOfSpeech.id,
                name: partOfSpeech.name,
              }}
              languageId={partOfSpeech.language.id}
              submitError={submitError && <Localized id='part-of-speech-save-error'/>}
              firstFieldRef={firstFieldRef}
              onSubmit={onSubmit}
              onCancel={onResolve}
              onDirtyChange={dirty => updatePanel({dirty})}
            />
          ) : <>
            <p>
              <Localized id='part-of-speech-not-found-error'/>
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

export const editPartOfSpeechPanel = (
  id: PartOfSpeechId
): PanelParams<void> => ({
  // eslint-disable-next-line react/display-name
  render: props => <EditPartOfSpeechPanel id={id} {...props}/>,
});
