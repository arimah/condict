import {useCallback} from 'react';
import produce from 'immer';

import {Form} from '../../form';
import {useOpenPanel} from '../../navigation';
import {LanguageId, PartOfSpeechId} from '../../graphql';
import type {NewPartOfSpeech} from '../../panels';

import {PartOfSpeechData, useCurrentPartsOfSpeech} from '../utils';

import NeutralCollator from './neutral-collator';
import {DefinitionFormState} from './types';

export type Options = {
  form: Form<DefinitionFormState>;
  languageId: LanguageId;
  initialPartsOfSpeech: readonly PartOfSpeechData[];
  onCreatePartOfSpeech: () => Promise<NewPartOfSpeech | null>;
};

export interface PartOfSpeechOptions {
  partsOfSpeech: readonly PartOfSpeechData[];
  handleCreatePartOfSpeech: () => void;
}

const usePartOfSpeechOptions = ({
  form,
  languageId,
  initialPartsOfSpeech,
  onCreatePartOfSpeech,
}: Options): PartOfSpeechOptions => {
  const openPanel = useOpenPanel;

  const {partsOfSpeech, setPartsOfSpeech} = useCurrentPartsOfSpeech(
    languageId,
    initialPartsOfSpeech,
    partsOfSpeech => {
      // If the currently selected part of speech has been deleted, deselect it.
      const selectedPos = form.get<PartOfSpeechId | null>('partOfSpeech');
      if (
        selectedPos !== null &&
        !partsOfSpeech.some(pos => pos.id === selectedPos)
      ) {
        form.set('partOfSpeech', null);
      }
    }
  );

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

  return {
    partsOfSpeech,
    handleCreatePartOfSpeech,
  };
};

export default usePartOfSpeechOptions;
