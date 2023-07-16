import {Dispatch, SetStateAction, useState, useEffect, useRef} from 'react';

import {Form} from '../form';
import {useDictionaryEvents, useExecute} from '../data';
import {LanguageId, PartOfSpeechId} from '../graphql';

import {AllPartsOfSpeechQuery} from './query';

export interface PartOfSpeechFields {
  readonly id: PartOfSpeechId;
  readonly name: string;
}

export interface CurrentPartsOfSpeech {
  partsOfSpeech: readonly PartOfSpeechFields[];
  /**
   * Forces an immediate update of the parts of speech. Can be used to add a
   * newly created part of speech before the dictionary event is received,
   * for an immediate UI update.
   */
  setPartsOfSpeech: Dispatch<SetStateAction<readonly PartOfSpeechFields[]>>;
}

/**
 * Watches a form's dirty state, invoking a change handler whenever the dirty
 * state changes. The change handler is *not* invoked with the form's initial
 * dirtiness.
 * @param form The form to watch
 * @param onDirtyChange A function that is invoked when the form's dirty state
 *        changes.
 */
export const useSyncFormDirtiness = (
  form: Form<any>,
  onDirtyChange: ((dirty: boolean) => void) | undefined
): void => {
  useEffect(() => {
    let lastDirty = form.state.isDirty;
    return form.watchState(() => {
      if (form.state.isDirty !== lastDirty) {
        lastDirty = form.state.isDirty;
        onDirtyChange?.(lastDirty);
      }
    });
  }, [onDirtyChange]);
};

/**
 * Maintains an up-to-date list of the parts of speech in a specific language.
 * The parts of speech are automatically refetched in response to applicable
 * dictionary events within the specified language. The list can also receive
 * manual updates to ensure immediate UI updates, and will eventually be
 * synchronized as events arrive.
 * @param languageId The language to fetch parts of speech from.
 * @param initial The initial parts of speech in the language, which *must* be
 *        fetched prior to using this hook.
 * @param onUpdate A function that receives updated parts of speech.
 */
export const useCurrentPartsOfSpeech = (
  languageId: LanguageId,
  initial: readonly PartOfSpeechFields[],
  onUpdate?: (partsOfSpeech: readonly PartOfSpeechFields[]) => void
): CurrentPartsOfSpeech => {
  const [partsOfSpeech, setPartsOfSpeech] = useState(initial);

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

      setPartsOfSpeech(partsOfSpeech);
      onUpdate?.(partsOfSpeech);
    });
  });

  return {partsOfSpeech, setPartsOfSpeech};
};
