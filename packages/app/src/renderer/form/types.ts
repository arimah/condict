import {Draft} from 'immer';
import {Dispatch, SetStateAction, FormEvent} from 'react';

export interface FormOptions<D> {
  initValue: () => D;
  /**
   * Determines if the form data is unchanged.
   * @param currentValue The current form data.
   * @param initialValue The initial form data.
   * @return True if the current value should be considered the same as the
   *         initial value. False if the form data has changed; this will
   *         mark the form as dirty.
   */
  isUnchanged?: (currentValue: D, initialValue: D) => boolean;
}

export interface Form<D> {
  readonly initialValue: D;

  /**
   * Gets the value of the field with the specified path, or the entire form
   * data if the path is empty.
   * @param path The path to read. If the path cannot be read successfully,
   *        such as if an object is null or undefined, an error is thrown.
   * @return The value of the specified field.
   */
  get<T = any>(path: string): T;

  /**
   * Sets the value of the field with the specified path, or the entire form
   * data if the path is empty.
   * @param path The path to write. If the path cannot be read successfully,
   *        such as if an object is null or undefined, an error is thrown.
   * @param value The new value of the field.
   */
  set<T>(path: string, value: T): void;

  /**
   * Updates the value of the field with the specified path, or the entire
   * form data if the path is empty.
   * @param path The path to update. If the path cannot be read successfully,
   *        such as if an object is null or undefined, an error is thrown.
   * @param updater A function that receives a draft of the field value or
   *        form data, and either returns the new value or mutates the draft.
   */
  update<T>(
    path: string,
    updater: (value: Draft<T>) => T | void
  ): void;

  /**
   * Registers a field for the specified path. Every field path must be unique.
   * @param name The name of the field, which is also the path into the form
   *        data that the field value is read from.
   * @param wake A setState function that is called to wake the field component.
   *        It receives a callback that increments the state value. This value
   *        *must* be stable across renders, as it is not updated once the field
   *        has been created.
   * @param options Additional field options.
   * @return The registered field.
   */
  register<T>(name: string, wake: WakeFn, options?: FieldOptions<T>): Field<T>;

  /**
   * Unregisters a field for the specified path. Fields should be unregistered
   * when they are no longer needed.
   * @param name The name of the field to unregister.
   */
  unregister(name: string): void;

  /**
   * Attaches a watcher to the field with the specified path, or the entire
   * form data if the path is empty.
   * @param path The path to watch.
   * @param wake A setState function that is called to wake the field component.
   *        It receives a callback that increments the state value. This value
   *        *must* be stable across renders, as it is not updated once the
   *        watcher has been created.
   * @return A function that is called to unwatch the field.
   */
  watch(path: string, wake: WakeFn): UnwatchFn;

  /**
   * Generates a function that can be passed as an `onSubmit` event handler
   * on a `<form>`.
   * @param submit A function that submits the form data.
   * @return A function which, when called, submits the form. If the form is
   *         currently validating or submitting,
   */
  handleSubmit(
    submit: (data: D) => Promise<void> | void
  ): HandleSubmitFn;

  readonly state: FormState;

  /**
   * Attaches a watcher to the form state.
   * @param wake A setState function that is called to wake the field component.
   *        It receives a callback that increments the state value. This value
   *        *must* be stable across renders, as it is not updated once the
   *        watcher has been created.
   * @return A function that is called to unwatch the state.
   */
  watchState(wake: WakeFn): UnwatchFn;
}

export type WakeFn = Dispatch<SetStateAction<number>>;

export type UnwatchFn = () => void;

export type HandleSubmitFn = (e: FormEvent) => void;

export interface FormState {
  /** True if the form data has changed from the initial data. */
  readonly isDirty: boolean;

  /**
   * True if every field is valid. This value reflects the result of the latest
   * validation and may not be up to date if `isValidating` is true.
   */
  readonly isValid: boolean;

  /** True if the form is currently being submitted. */
  readonly isSubmitting: boolean;
}

export interface FieldOptions<T> {
  path?: string;
  validate?: Validators<T>;
  focus?: () => void;
}

export interface Field<T> {
  /** The current value of the field. */
  readonly value: T;

  /**
   * Sets the field value.
   * @param value The new field value.
   */
  readonly set: (value: T) => void;

  /**
   * Updates the field value.
   * @param updater A function that receives a draft of the field value, and
   *        either returns the new value or mutates the draft.
   */
  readonly update: (
    updater: (value: Draft<T>) => T | void
  ) => void;

  /**
   * True if the field is valid. This value reflects the result of the latest
   * validation and may not be up to date if the form is validating.
   */
  readonly isValid: boolean;

  /**
   * The latest error type returned by validation, or null if the field is
   * valid. This value reflects the result of the latest validation and may
   * not be up to date.
   */
  readonly error: string | null;
}

export type Validators<T> =
  | ValidatorFn<T>
  | ValidatorFn<T>[];

export type ValidatorFn<T> = (
  value: T
) => Promise<string | null> | string | null;
