import {ReactNode} from 'react';

export type ComponentDemo<S extends object = {}, E = S> = {
  readonly name: string;
  readonly initialState: S;
  readonly alignX?: 'center' | 'stretch';
  readonly alignY?: 'center' | 'stretch';
  readonly importState?: (state: E) => S;
  readonly exportState?: (state: S) => E;
  readonly controls?: ControlsRenderFunc<S>;
  readonly contents: ContentRenderFunc<S>;
};

export type ControlsRenderFunc<S extends object> = (
  state: S,
  setState: SetStateFunc<S>,
  toggleState: ToggleStateFunc<S>
) => ReactNode[];

export type ContentRenderFunc<S extends object> = (
  state: S,
  setState: SetStateFunc<S>,
  toggleState: ToggleStateFunc<S>
) => ReactNode;

export type SetStateFunc<S extends object> = <P extends keyof S>(partialState: Pick<S, P>) => void;

export type ToggleStateFunc<S extends object> = <P extends keyof S>(prop: P) => void;
