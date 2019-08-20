export type DataFields = {
  // Header text or inflection pattern
  text: string;
  // Custom inflected form (data cells only)
  customForm: string | null;
  inflectedFormId: number | null;
};

export type Messages = {
  /** "Form is inflected automatically.", SR-only description of a cell. */
  formIsInflected(): string;
  /** "Form is deleted.", SR-only description of a cell. */
  formIsDeleted(): string;
  /** "Custom form.", SR-only description of a cell. */
  customForm(): string;
  /**
   * "Type here to define a custom form", SR-only helper text in cell editor
   * dialog.
   */
  cellDialogInputHelper(): string;
  /** "Revert to default form", button in cell editor dialog. */
  useDefaultFormButton(): string;
  /** "Use default form", context menu item. */
  useDefaultFormMenu(): string;
  /** "Delete this form", context menu item. */
  deleteThisForm(): string;
};
