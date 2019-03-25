import validator, {map, lengthBetween} from '../validator';
import sizeOfColumn from '../size-of-column';

export interface ValidTag {
  tag: string;
}

const TagNameSize = sizeOfColumn('tags', 'name');

export const validateTag =
  validator<string>('tag')
    .do(map(tag => tag.trim()))
    .do(lengthBetween(1, TagNameSize))
    .do(map<string, ValidTag>(tag => ({tag})))
    .validate;
