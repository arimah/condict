import {Validate} from 'react-hook-form';

export type Validators<T> =
  | Validate<T>
  | Record<string, Validate<T>>;
