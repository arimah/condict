import produce, {Draft} from 'immer';

import {useLazyRef} from '@condict/ui';

import {get, set, update, splitPath, isPathDirty} from './path';
import {
  Form,
  FormOptions,
  FormState,
  Field,
  FieldOptions,
  Validators,
  ValidatorFn,
  WakeFn,
  UnwatchFn,
  HandleSubmitFn,
} from './types';

interface FormInternals<D> {
  value: D;
  state: FormState;
  calcIsUnchanged: (current: D, initial: D) => boolean;
  hasSubmitted: boolean;
  readonly initialValue: D;

  readonly fields: Map<string, RegisteredField<any>>;
  readonly watchers: Map<string, Watcher>;

  readonly stateWatchers: Set<WakeFn>;
  dirtyWatchers: Set<Watcher>;

  isValidityDirty: boolean;
  isStateDirty: boolean;

  /** Shared timeout ID for form value watchers and form state watchers. */
  watcherWakeTimeoutId: number | null;

  update(updater: (data: D) => D, changedPath: readonly string[]): void;

  validateChanged(fields: Iterable<RegisteredField<any>>): void;

  validateAll(): Promise<boolean>;

  setValidity(field: RegisteredField<any>, lastError: string | null): void;

  updateFormState(
    updater: (draft: Draft<FormState>) => FormState | void
  ): void;

  queueDirtyHandler(): void;
}

interface Watcher {
  readonly pathParts: readonly string[];
  readonly handlers: Set<WakeFn>;
}

interface RegisteredField<T> {
  readonly field: Field<T>;
  path: string;
  pathParts: readonly string[];
  wake: WakeFn;
  validate: Validators<T> | undefined;
  focus: (() => void) | undefined;
  lastError: string | null;
  validation: Promise<void> | null;
}

const inc = (n: number) => n + 1;

const defaultIsUnchanged = <T>(a: T, b: T) => a === b;

export const useForm = <D>(options: FormOptions<D>): Form<D> => {
  const {
    initValue,
    isUnchanged = defaultIsUnchanged,
  } = options;

  const internal = useLazyRef<FormInternals<D>>(() => {
    const value = initValue();
    return {
      value,
      state: {
        isDirty: false,
        isValid: true,
        isSubmitting: false,
      },
      calcIsUnchanged: isUnchanged,
      hasSubmitted: false,
      initialValue: value,

      fields: new Map<string, RegisteredField<any>>(),
      watchers: new Map<string, Watcher>(),

      stateWatchers: new Set<WakeFn>(),
      dirtyWatchers: new Set<Watcher>(),

      isValidityDirty: false,
      isStateDirty: false,

      watcherWakeTimeoutId: null,
      dirtinessTimeoutId: null,

      update(updater, changedPath) {
        // Disallow edits while submitting
        if (internal.state.isSubmitting) {
          return;
        }

        const prev = internal.value;
        const next = updater(prev);
        if (prev === next) {
          // If nothing has changed, we don't need to update anything.
          return;
        }
        internal.value = next;

        // If something has changed, we need to figure out which fields and
        // watchers are affected. Field updates are emitted immediately, as
        // they typically happen during an event. Watchers get woken later,
        // so as not to disrupt the event with too many renders.
        const dirtyFields = new Set<RegisteredField<any>>();
        for (const field of internal.fields.values()) {
          if (isPathDirty(field.pathParts, prev, next, changedPath)) {
            dirtyFields.add(field);
          }
        }

        let foundDirtyWatchers = false;
        for (const watcher of internal.watchers.values()) {
          if (isPathDirty(watcher.pathParts, prev, next, changedPath)) {
            internal.dirtyWatchers.add(watcher);
            foundDirtyWatchers = true;
          }
        }

        if (foundDirtyWatchers) {
          internal.queueDirtyHandler();
        }

        if (dirtyFields.size > 0) {
          for (const field of dirtyFields) {
            field.wake(inc);
          }

          // If the form has been submitted (successfully or not), validate
          // changed fields whenever the form is edited.
          if (internal.hasSubmitted) {
            internal.validateChanged(dirtyFields);
          }
        }

        internal.updateFormState(draft => {
          draft.isDirty = !internal.calcIsUnchanged(
            internal.value,
            internal.initialValue
          );
        });
      },

      validateChanged(fields) {
        window.setTimeout(() => {
          for (const field of fields) {
            const value = get(internal.value, field.pathParts);
            const result = validate(value, field);

            if (result instanceof Promise) {
              const promise = result.then(res => {
                if (field.validation === promise) {
                  internal.setValidity(field, res);
                }
              });
              field.validation = promise;
            } else {
              internal.setValidity(field, result);
            }
          }
        });
      },

      async validateAll() {
        let isValid = true;

        const asyncResults: Promise<void>[] = [];
        for (const field of internal.fields.values()) {
          const value = get(internal.value, field.pathParts);
          const result = validate(value, field);

          if (result instanceof Promise) {
            const promise = result.then(res => {
              internal.setValidity(field, res);
              if (res !== null) {
                isValid = false;
              }
            });
            field.validation = promise;
            asyncResults.push(promise);
          } else {
            internal.setValidity(field, result);
            if (result !== null) {
              isValid = false;
            }
          }
        }

        if (asyncResults.length > 0) {
          await Promise.all(asyncResults);
        }

        internal.updateFormState(draft => {
          draft.isValid = isValid;
        });

        return isValid;
      },

      setValidity(field, lastError) {
        field.validation = null;
        if (lastError !== field.lastError) {
          field.lastError = lastError;
          field.wake(inc);

          // If we have an error, then the form is definitely invalid, and we
          // don't have to visit every field to recompute validity.
          if (lastError !== null) {
            internal.updateFormState(draft => {
              draft.isValid = false;
            });
          } else {
            internal.isValidityDirty = true;
            internal.queueDirtyHandler();
          }
        }
      },

      updateFormState(updater) {
        const nextState = produce(internal.state, updater);
        if (nextState !== internal.state) {
          internal.state = nextState;
          internal.isStateDirty = true;
          internal.queueDirtyHandler();
        }
      },

      queueDirtyHandler() {
        if (internal.watcherWakeTimeoutId === null) {
          internal.watcherWakeTimeoutId = window.setTimeout(() => {
            if (internal.isValidityDirty) {
              let isValid = true;
              for (const field of internal.fields.values()) {
                if (field.lastError !== null) {
                  isValid = false;
                  break;
                }
              }

              internal.updateFormState(draft => {
                draft.isValid = isValid;
              });
            }

            internal.watcherWakeTimeoutId = null;

            if (internal.dirtyWatchers.size > 0) {
              const watchers = internal.dirtyWatchers;
              internal.dirtyWatchers = new Set<Watcher>();
              for (const watcher of watchers) {
                for (const wake of watcher.handlers) {
                  wake(inc);
                }
              }
            }

            if (internal.isStateDirty) {
              internal.isStateDirty = false;
              for (const wake of internal.stateWatchers) {
                wake(inc);
              }
            }
          });
        }
      },
    };
  }).current;

  const form = useLazyRef<Form<D>>(() => ({
    get state(): FormState {
      return internal.state;
    },

    get initialValue(): D {
      return internal.initialValue;
    },

    get: <T>(path: string): T => {
      const pathParts = splitPath(path);
      return get(internal.value, pathParts) as T;
    },

    set: <T>(path: string, value: T): void => {
      const pathParts = splitPath(path);
      internal.update(data => set(data, pathParts, value) as D, pathParts);
    },

    update: <T>(
      path: string,
      updater: (value: Draft<T>) => T | void
    ): void => {
      const pathParts = splitPath(path);
      internal.update(
        data => update(
          data,
          pathParts,
          updater as (value: unknown) => unknown
        ) as D,
        pathParts
      );
    },

    register: <T>(
      name: string,
      wake: WakeFn,
      options: FieldOptions<T> = {}
    ): Field<T> => {
      const path = options.path ?? name;

      let field = internal.fields.get(name) as RegisteredField<T> | undefined;
      if (!field) {
        const pathParts = splitPath(path);
        const f: RegisteredField<T> = {
          path,
          pathParts,
          field: {
            get value() {
              return get(internal.value, f.pathParts) as T;
            },
            set: value => internal.update(
              data => set(data, f.pathParts, value) as D,
              f.pathParts
            ),
            update: updater => internal.update(
              data => update(
                data,
                f.pathParts,
                updater as (value: unknown) => unknown
              ) as D,
              f.pathParts
            ),
            get isValid(): boolean {
              return f.lastError === null;
            },
            get error(): string | null {
              return f.lastError;
            },
          },
          wake,
          validate: options.validate,
          focus: options.focus,
          lastError: null,
          validation: null,
        };
        field = f;
        internal.fields.set(name, f);
      } else {
        if (path !== field.path) {
          field.path = path;
          field.pathParts = splitPath(path);
        }
        field.validate = options.validate;
        field.focus = options.focus;
      }
      return field.field;
    },

    unregister: (name: string): void => {
      internal.fields.delete(name);
    },

    watch: (
      path: string,
      wake: WakeFn
    ): UnwatchFn => {
      const pathParts = splitPath(path);
      let watcher = internal.watchers.get(path);
      if (!watcher) {
        watcher = {
          pathParts,
          handlers: new Set<WakeFn>(),
        };
        internal.watchers.set(path, watcher);
      }

      watcher.handlers.add(wake);
      return () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        watcher!.handlers.delete(wake);
        // Make sure to clean up unnecessary watchers
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (watcher!.handlers.size === 0) {
          internal.watchers.delete(path);
        }
      };
    },

    handleSubmit: (
      submit: (data: D) => Promise<void> | void
    ): HandleSubmitFn => {
      return e => {
        e.preventDefault();

        if (internal.state.isSubmitting) {
          // Prevent double submits
          return;
        }

        internal.hasSubmitted = true;
        internal.updateFormState(draft => {
          draft.isSubmitting = true;
        });
        internal.validateAll().then(
          valid => {
            if (valid) {
              return submit(internal.value);
            } else {
              // Focus the first invalid field that can be focused.
              for (const field of internal.fields.values()) {
                if (field.lastError !== null && field.focus) {
                  field.focus();
                  break;
                }
              }
            }
          },
          e => console.log('Form validation error:', e)
        ).finally(() => {
          internal.updateFormState(draft => {
            draft.isSubmitting = false;
          });
        });
      };
    },

    watchState: (wake: WakeFn): UnwatchFn => {
      internal.stateWatchers.add(wake);
      return () => {
        internal.stateWatchers.delete(wake);
      };
    },

    validateOnSubmit: <T>(validate: ValidatorFn<T>): ValidatorFn<T> => {
      let lastResult: string | null = null;
      return (value: T): Promise<string | null> | string | null => {
        if (!internal.state.isSubmitting) {
          return lastResult;
        }
        const result = validate(value);
        if (result instanceof Promise) {
          return result.then(validity => {
            lastResult = validity;
            return validity;
          });
        } else {
          lastResult = result;
          return result;
        }
      };
    },
  })).current;

  return form;
};

const validate = <T>(
  value: T,
  field: RegisteredField<T>
): Promise<string | null> | string | null => {
  if (!hasValidators(field)) {
    // If the field has no validators, it always succeeds.
    return null;
  }

  let syncResult: string | null = null;
  let asyncResults: Promise<string | null>[] | null = null;
  for (const validate of eachValidator(field)) {
    const result = validate(value);
    if (result instanceof Promise) {
      if (!asyncResults) {
        asyncResults = [];
      }
      asyncResults.push(result);
    } else if (result !== null) {
      syncResult = result;
      // We've already failed; there is no need to try any further validators.
      break;
    }
  }

  if (syncResult !== null) {
    if (asyncResults) {
      // Let all async validators finish, and swallow any error that occurs.
      Promise.all(asyncResults).catch(() => {/* no-op */});
    }
    return syncResult;
  }
  if (asyncResults) {
    return new Promise<string | null>(resolve => {
      let valid = true;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const promises = asyncResults!.map(async promise => {
        let result: string | null;
        try {
          result = await promise;

          // If validation *failed* and no other validation has failed so far,
          // we can end validation early.
          if (result !== null && valid) {
            valid = false;
            resolve(result);
          }
          return;
        } catch (_e) {
          // Exceptions generate a validation failure.
          if (valid) {
            valid = false;
            resolve('exception');
          }
        }
      });

      void Promise.all(promises).then(() => {
        if (valid) {
          resolve(null);
        }
      });
    });
  }
  return null;
};

const hasValidators = <T>(field: RegisteredField<T>): boolean => {
  if (field.validate == null) {
    return false;
  }
  if (Array.isArray(field.validate) && field.validate.length === 0) {
    return false;
  }
  return true;
};

function* eachValidator<T>(
  field: RegisteredField<T>
): IterableIterator<ValidatorFn<T>> {
  if (field.validate == null) {
    return;
  }
  if (typeof field.validate === 'function') {
    yield field.validate;
  } else {
    yield* field.validate;
  }
}
