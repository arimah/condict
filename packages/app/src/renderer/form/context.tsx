import React, {ReactNode, useContext, useState, useEffect} from 'react';

import {
  Form,
  Field,
  FieldOptions,
  FormState,
} from './types';

export type FormProviderProps = {
  form: Form<any>;
  children: ReactNode;
};

export const FormContext = React.createContext<Form<any> | null>(null);

export const FormProvider = (props: FormProviderProps): JSX.Element =>
  <FormContext.Provider value={props.form}>
    {props.children}
  </FormContext.Provider>;

export const useNearestForm = <D = any>(): Form<D> => {
  const value = useContext(FormContext);
  if (!value) {
    throw new Error('No form available');
  }
  return value as Form<D>;
};

export function useField<T>(
  form: Form<any>,
  name: string,
  options?: FieldOptions<T>
): Field<T> {
  const [_state, setState] = useState(0);
  useEffect(() => () => form.unregister(name), []);
  return form.register(name, setState, options);
}

export function useFormValue<T>(
  form: Form<any>,
  path: string
): T {
  const [_state, setState] = useState(0);
  useEffect(() => form.watch(path, setState), [path]);
  return form.get(path);
}

export const useFormState = (form: Form<any>): FormState => {
  const [_state, setState] = useState(0);
  useEffect(() => form.watchState(setState), []);
  return form.state;
};
