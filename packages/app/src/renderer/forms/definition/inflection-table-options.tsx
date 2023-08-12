import {useLiveData} from '../../data';
import {LanguageId, OperationResult} from '../../graphql';

import {AllInflectionTablesQuery} from './query';
import {InflectionTableData} from './types';

export type Options = {
  languageId: LanguageId;
  initialInflectionTables: readonly InflectionTableData[];
};

const useInflectionTableOptions = ({
  languageId,
  initialInflectionTables,
}: Options): readonly InflectionTableData[] =>
  useLiveData(AllInflectionTablesQuery, {lang: languageId}, {
    initial: initialInflectionTables,
    mapData,

    shouldReload: event =>
      event.type === 'inflectionTable' &&
      event.languageId === languageId,

    ignoreReloadErrors: true,
  }).data;

export default useInflectionTableOptions;

const mapData = (
  data: OperationResult<typeof AllInflectionTablesQuery>
): readonly InflectionTableData[] =>
  // If the language has been deleted, use an empty list.
  data.language?.inflectionTables ?? [];
