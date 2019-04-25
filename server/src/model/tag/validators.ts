import validator, {lengthBetween} from '../validator';
import sizeOfColumn from '../size-of-column';

export interface ValidTag {
  tag: string;
}

const TagNameSize = sizeOfColumn('tags', 'name');

export const validateTag =
  validator<string>('tag')
    .do(tag => tag.trim())
    .do(lengthBetween(1, TagNameSize))
    .do<ValidTag>(tag => ({tag}))
    .validate;
