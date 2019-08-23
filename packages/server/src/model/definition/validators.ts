import {StemInput} from '../../graphql/types';

import validator, {lengthBetween} from '../validator';
import sizeOfColumn from '../size-of-column';

const StemNameSize = sizeOfColumn('definition_stems', 'name');
const StemValueSize = sizeOfColumn('definition_stems', 'value');
const FormValueSize = sizeOfColumn('definition_forms', 'inflected_form');

export const validateStemName =
  validator<string>('name')
    .do(lengthBetween(1, StemNameSize))
    .validate;

export const validateStemValue =
  validator<string>('value')
    .do(lengthBetween(0, StemValueSize))
    .validate;

export const validateStems = (stems: StemInput[]): StemInput[] =>
  stems.map(stem => ({
    name: validateStemName(stem.name),
    value: validateStemValue(stem.value),
  }));

export const validateFormValue =
  validator<string>('value')
    .do(lengthBetween(0, FormValueSize))
    .validate;
