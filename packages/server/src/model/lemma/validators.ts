import validator, {lengthBetween, Valid} from '../validator';
import sizeOfColumn from '../size-of-column';

const TermSize = sizeOfColumn('lemmas', 'term_unique');

export type ValidTerm = Valid<string, 'LemmaTerm'>;

export const validateTerm =
  validator<string>('term')
    .do(value => value.trim())
    .do(lengthBetween(1, TermSize))
    .do(value => value as ValidTerm)
    .validate;
