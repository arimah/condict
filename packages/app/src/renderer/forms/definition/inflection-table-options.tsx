import {useState, useRef} from 'react';

import {useExecute, useDictionaryEvents} from '../../data';
import {LanguageId} from '../../graphql';

import {AllInflectionTablesQuery} from './query';
import {InflectionTableData} from './types';

export type Options = {
  languageId: LanguageId;
  initialInflectionTables: readonly InflectionTableData[];
};

const useInflectionTableOptions = ({
  languageId,
  initialInflectionTables,
}: Options): readonly InflectionTableData[] => {
  const [inflectionTables, setInflectionTables] = useState(initialInflectionTables);

  const execute = useExecute();

  const requestId = useRef(0);
  useDictionaryEvents(({events}) => {
    const needRefetch = events.some(event =>
      event.type === 'inflectionTable' &&
      event.languageId === languageId
    );
    if (!needRefetch) {
      return;
    }

    const id = ++requestId.current;
    void execute(AllInflectionTablesQuery, {lang: languageId}).then(result => {
      if (result.errors) {
        console.error('Error fetching inflection tables:', result.errors);
        return;
      }

      if (id !== requestId.current) {
        // Old request; ignore results.
        return;
      }

      // If there were no errors, there should be a result. If the language
      // has been deleted, just use an empty list.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setInflectionTables(result.data!.language?.inflectionTables ?? []);
    });
  });

  return inflectionTables;
};

export default useInflectionTableOptions;
