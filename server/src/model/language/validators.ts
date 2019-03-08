import Adaptor from '../../database/adaptor';

import validator, {map, lengthBetween, matches, unique} from '../validator';
import sizeOfColumn from '../size-of-column';

const NameSize = sizeOfColumn('languages', 'name');
const UrlNameSize = sizeOfColumn('languages', 'url_name');

export const validateName = (
  db: Adaptor,
  currentId: number | null,
  value: string
) =>
  validator<string>('name')
    .do(map(name => name.trim()))
    .do(lengthBetween(1, NameSize))
    .do(unique(currentId, async name => {
      const row = await db.get<{id: number}>`
        select id
        from languages
        where name = ${name}
      `;
      return row ? row.id : null;
    }))
    .validate(value);

export const validateUrlName = (
  db: Adaptor,
  currentId: number | null,
  value: string
) =>
  validator<string>('urlName')
    .do(map(urlName => urlName.toLowerCase().trim()))
    .do(lengthBetween(1, UrlNameSize))
    .do(matches(/^[a-z0-9-]+$/, () => 'can only contain a-z, 0-9 and -'))
    .do(unique(currentId, async urlName => {
      const row = await db.get<{id: number}>`
        select id
        from languages
        where url_name = ${urlName}
      `;
      return row ? row.id : null;
    }))
    .validate(value);
