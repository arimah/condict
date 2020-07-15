import {StemInput} from '../../graphql/types';

import validator, {minLength} from '../validator';

export const validateStemName =
  validator<string>('name')
    .do(minLength(1))
    .validate;

export const validateStems = (stems: StemInput[]): StemInput[] =>
  stems.map(stem => ({
    name: validateStemName(stem.name),
    value: stem.value,
  }));
