import validator, {lengthBetween, Valid} from '../validator';
import sizeOfColumn from '../size-of-column';

export type ValidTag = Valid<string, 'Tag'>;

const TagNameSize = sizeOfColumn('tags', 'name');

export const validateTag =
  validator<string>('tag')
    .do(tag => tag.trim())
    .do(lengthBetween(1, TagNameSize))
    .do<ValidTag>(tag => tag as ValidTag)
    .validate;
