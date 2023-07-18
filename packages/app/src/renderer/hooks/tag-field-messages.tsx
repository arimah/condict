import {useMemo} from 'react';
import {Localized, useLocalization} from '@fluent/react';

import {FieldInputMessages} from '@condict/ui';

export const useTagFieldMessages = (): FieldInputMessages => {
  const {l10n} = useLocalization();
  return useMemo(() => ({
    noResults: query =>
      <Localized
        id='tag-input-no-results'
        vars={{query}}
        elems={{query: <i/>}}
      />,
    noResultsHelp: () => l10n.getString('tag-input-no-results'),
    typeToSearch: () => l10n.getString('tag-input-type-to-search'),
    noValues: () => l10n.getString('no-values'),
  }), [l10n]);
};
