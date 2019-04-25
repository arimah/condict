import validator, {lengthBetween} from '../validator';
import sizeOfColumn from '../size-of-column';

const TermSize = sizeOfColumn('lemmas', 'term_unique');

export interface ValidTerm {
  value: string;
}

export const validateTerm =
  validator<string>('term')
    .do(value => value.trim())
    .do(lengthBetween(1, TermSize))
    .do<ValidTerm>(value => ({value}))
    .validate;
