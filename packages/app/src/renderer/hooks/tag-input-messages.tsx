import {useMemo} from 'react';
import {useLocalization} from '@fluent/react';

import {TagInputMessages} from '@condict/ui';

export const useTagInputMessages = (): TagInputMessages => {
  const {l10n} = useLocalization();
  return useMemo(() => ({
    componentName: () => l10n.getString('tag-input-component-name'),
    inputLabel: () => l10n.getString('tag-input-input-label'),
    usageHelper: () => l10n.getString('tag-input-usage-helper'),
    currentTags: tags => {
      if (tags.length === 0) {
        return l10n.getString('tag-input-no-tags');
      }
      return l10n.getString('tag-input-current-tags', {
        tagCount: tags.length,
        tagList: tags.join(', '),
      });
    },
    tagPosition: (index, total) =>
      l10n.getString('tag-input-tag-position', {index, total}),
    tagAdded: tag => l10n.getString('tag-input-tag-added', {tag}),
    noNewTags: () => l10n.getString('tag-input-no-new-tags'),
    tagRemoved: tag => l10n.getString('tag-input-tag-removed', {tag}),
    editingTag: (tag, newTag) => newTag
      ? l10n.getString('tag-input-editing-added-tag', {tag, newTag})
      : l10n.getString('tag-input-editing-tag', {tag}),
  }), [l10n]);
};
