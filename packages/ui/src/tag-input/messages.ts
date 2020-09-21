import {Messages} from './types';

const DefaultMessages: Messages = {
  componentName: () => 'Tag input',
  inputLabel: () => 'New tag',
  usageHelper: () => 'Use arrow keys to select tags.',
  currentTags: tags => {
    switch (tags.length) {
      case 0: return 'No tags.';
      case 1: return `1 tag: ${tags[0]}`;
      default: return `${tags.length} tags: ${tags.join(', ')}`;
    }
  },
  tagPosition: (n, count) => `Tag ${n} of ${count}`,
  /**
   * "Tag added: TAGS" or "N tags added: TAGS", SR-only announcement when one
   * or more tags are added. This message is not used when `tags` is empty.
   * @param tags The added tags.
   */
  tagsAdded: tags => {
    if (tags.length === 1) {
      return `Tag added: ${tags[0]}`;
    } else {
      return `${tags.length} tags added: ${tags.join(', ')}`;
    }
  },
  /**
   * "No new tags added.", SR-only announcement when no tags were added as a
   * result of the user committing the current value.
   */
  noNewTags: () => 'No new tags added.',
  /**
   * "Tag removed: TAG", SR-only announcement when a tag is removed.
   * @param tag The removed tag.
   */
  tagRemoved: tag => `Tag removed: ${tag}`,
  /**
   * "Editing tag: TAG.", SR-only announcement when editing a tag.
   * @param tag The tag that is being edited.
   */
  editingTag: (tag, newTag) =>
    newTag
      ? `Editing tag: ${tag}, and added: ${newTag}`
      : `Editing tag: ${tag}`,
};

export default DefaultMessages;
