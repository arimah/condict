import {Dispatch, SetStateAction, useCallback, useEffect} from 'react';

import {Form} from '../form';
import {useLiveMutData} from '../data';
import {LanguageId, PartOfSpeechId, OperationResult} from '../graphql';

import {AllPartsOfSpeechQuery} from './query';

export interface PartOfSpeechData {
  readonly id: PartOfSpeechId;
  readonly name: string;
}

export interface CurrentPartsOfSpeech {
  partsOfSpeech: readonly PartOfSpeechData[];
  /**
   * Forces an immediate update of the parts of speech. Can be used to add a
   * newly created part of speech before the dictionary event is received,
   * for an immediate UI update.
   */
  setPartsOfSpeech: Dispatch<SetStateAction<readonly PartOfSpeechData[]>>;
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
  initial: readonly PartOfSpeechData[],
  onUpdate?: (partsOfSpeech: readonly PartOfSpeechData[]) => void
): CurrentPartsOfSpeech => {
  const [{data: partsOfSpeech}, setData] = useLiveMutData(
    AllPartsOfSpeechQuery,
    {lang: languageId},
    {
      initial,
      mapData: mapPartOfSpeechData,

      shouldReload: event =>
        event.type === 'partOfSpeech' &&
        event.languageId === languageId,

      ignoreReloadErrors: true,

      onLoadedData: onUpdate,
    }
  );

  const setPartsOfSpeech = useCallback((
    action: SetStateAction<readonly PartOfSpeechData[]>
  ): void => {
    if (typeof action === 'function') {
      setData(prev => ({
        state: 'data',
        data: action(prev.data),
      }));
    } else {
      setData({state: 'data', data: action});
    }
  }, []);

  return {partsOfSpeech, setPartsOfSpeech};
};

const mapPartOfSpeechData = (
  data: OperationResult<typeof AllPartsOfSpeechQuery>
): readonly PartOfSpeechData[] =>
  // If the language has been deleted, use an empty list.
  data.language?.partsOfSpeech ?? [];
