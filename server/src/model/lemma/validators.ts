import validator, {map, lengthBetween} from '../validator';
import sizeOfColumn from '../size-of-column';

const TermSize = sizeOfColumn('lemmas', 'term_unique');

export const validateTerm =
  validator<string>('term')
    .do(map(value => value.trim()))
    .do(lengthBetween(1, TermSize))
    .validate;
