import validator, {minLength, Valid} from '../validator';

export type ValidTerm = Valid<string, 'LemmaTerm'>;

export const validateTerm =
  validator<string>('term')
    .do(value => value.trim())
    .do(minLength(1, 'Lemma term cannot be empty'))
    .do(value => value as ValidTerm)
    .validate;
