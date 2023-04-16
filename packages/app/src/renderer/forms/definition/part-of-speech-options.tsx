import {useState, useCallback, useRef} from 'react';
import produce from 'immer';

import {Form} from '../../form';
import {useOpenPanel} from '../../navigation';
import {useExecute, useDictionaryEvents} from '../../data';
import {LanguageId, PartOfSpeechId} from '../../graphql';
import type {NewPartOfSpeech} from '../../panels';

import NeutralCollator from './neutral-collator';
import {AllPartsOfSpeechQuery} from './query';
import {DefinitionFormState, PartOfSpeechFields} from './types';

export type Options = {
  form: Form<DefinitionFormState>;
  languageId: LanguageId;
  initialPartsOfSpeech: readonly PartOfSpeechFields[];
  onCreatePartOfSpeech: () => Promise<NewPartOfSpeech | null>;
};

export interface PartOfSpeechOptions {
  partsOfSpeech: readonly PartOfSpeechFields[];
  handleCreatePartOfSpeech: () => void;
}

const usePartOfSpeechOptions = ({
  form,
  languageId,
  initialPartsOfSpeech,
  onCreatePartOfSpeech,
}: Options): PartOfSpeechOptions => {
  const openPanel = useOpenPanel;

  const [partsOfSpeech, setPartsOfSpeech] = useState(initialPartsOfSpeech);

  const handleCreatePartOfSpeech = useCallback(() => {
    void onCreatePartOfSpeech().then(newPos => {
      if (newPos) {
        // When a part of speech is created, we must immediately add it to the
        // part of speech list, so we can select it.
        setPartsOfSpeech(prevPartsOfSpeech => {
          if (prevPartsOfSpeech.some(pos => pos.id === newPos.id)) {
            // If we've somehow already received the event and managed to reload
            // the data, there's nothing to do.
            return prevPartsOfSpeech;
          }
          return produce(prevPartsOfSpeech, draft => {
            draft.push({
              id: newPos.id,
              name: newPos.name,
            });
            // Sort the list so the options end up in the order they'll probably
            // be in once we reload.
            draft.sort((a, b) => NeutralCollator.compare(a.name, b.name));
          });
        });
        // Always select the new part of speech.
        form.set('partOfSpeech', newPos.id);
      }
    });
  }, [openPanel, onCreatePartOfSpeech]);

  const execute = useExecute();

  const requestId = useRef(0);
  useDictionaryEvents(({events}) => {
    const needRefetch = events.some(event =>
      event.type === 'partOfSpeech' &&
      event.languageId === languageId
    );
    if (!needRefetch) {
      return;
    }

    const id = ++requestId.current;
    void execute(AllPartsOfSpeechQuery, {lang: languageId}).then(result => {
      if (result.errors) {
        console.error('Error fetching parts of speech:', result.errors);
        return;
      }

      if (id !== requestId.current) {
        // Old request; ignore results.
        return;
      }

      // If there were no errors, there should be a result. If the language
      // has been deleted, just use an empty list.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const partsOfSpeech = result.data!.language?.partsOfSpeech ?? [];

      // If the currently selected part of speech has been deleted, deselect it.
      const selectedPos = form.get<PartOfSpeechId | null>('partOfSpeech');
      if (
        selectedPos !== null &&
        !partsOfSpeech.some(pos => pos.id === selectedPos)
      ) {
        form.set('partOfSpeech', null);
      }
      setPartsOfSpeech(partsOfSpeech);
    });
  });

  return {
    partsOfSpeech,
    handleCreatePartOfSpeech,
  };
};

export default usePartOfSpeechOptions;
