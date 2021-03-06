import validator, {Valid, minLength} from '../validator';

export type ValidTag = Valid<string, 'Tag'>;

export const validateTag =
  validator<string>('tag')
    .do(tag => tag.trim())
    .do(minLength(1, 'Tag cannot be empty'))
    .do<ValidTag>(tag => tag as ValidTag)
    .validate;
