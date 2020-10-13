import {RefObject} from 'react';

export class TagInputChild {
  private elemRef: RefObject<HTMLButtonElement | HTMLInputElement>;
  public tag: string | null;

  public constructor(
    elemRef: RefObject<HTMLButtonElement | HTMLInputElement>,
    tag: string | null
  ) {
    this.elemRef = elemRef;
    this.tag = tag;
  }

  public get elem(): HTMLButtonElement | HTMLInputElement {
    if (this.elemRef.current === null) {
      throw new Error('Element has been unmounted but not unregistered');
    }
    return this.elemRef.current;
  }
}

export interface Messages {
  /** "Tag input", SR-only name of the component itself. */
  componentName(): string;
  /** "New tag", SR-only label of the textbox. */
  inputLabel(): string;
  /** "Use arrow keys to select tags.", SR-only helper text. */
  usageHelper(): string;
  /**
   * "No tags." or "n tags: alpha, beta, gamma.", SR-only description of the
   * current tags.
   * @param tags The currently committed tags.
   */
  currentTags(tags: readonly string[]): string;
  /**
   * "Tag N of COUNT.", SR-only helper for an individual tag.
   * @param n The tag index (1-based)
   * @param count The total number of tags.
   */
  tagPosition(n: number, count: number): string;
  /**
   * "Tag added: TAGS" or "N tags added: TAGS", SR-only announcement when one
   * or more tags are added. This message is not used when `tags` is empty.
   * @param tags The added tags.
   */
  tagsAdded(tags: readonly string[]): string;
  /**
   * "No new tags added.", SR-only announcement when no tags were added as a
   * result of the user committing the current value.
   */
  noNewTags(): string;
  /**
   * "Tag removed: TAG", SR-only announcement when a tag is removed.
   * @param tag The removed tag.
   */
  tagRemoved(tag: string): string;
  /**
   * "Editing tag: TAG.", SR-only announcement when editing a tag.
   * @param tag The tag that is being edited.
   * @param newTag The tag that was committed when editing started (the current
   *        textbox value), or the empty string if no new tags were added.
   */
  editingTag(tag: string, newTag: string): string;
}
