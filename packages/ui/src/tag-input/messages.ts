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
  tagAdded: tag => `Tag added: ${tag}`,
  noNewTags: () => 'No new tags added.',
  tagRemoved: tag => `Tag removed: ${tag}`,
  editingTag: (tag, newTag) =>
    newTag
      ? `Editing tag: ${tag}, and added: ${newTag}`
      : `Editing tag: ${tag}`,
};

export default DefaultMessages;
