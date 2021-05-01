import {DataWriter} from '../../database';
import {LinkRefCollector, validateDescription} from '../../rich-text';
import {BlockElementInput} from '../../graphql';

import {Description} from './model';
import {DescriptionId} from './types';

const ignoreLinkRefs: LinkRefCollector = () => { /* no-op */ };

const DescriptionMut = {
  insert(
    db: DataWriter,
    description: BlockElementInput[]
  ): DescriptionId {
    const finalDescription = validateDescription(description, ignoreLinkRefs);

    const {insertId: id} = db.exec<DescriptionId>`
      insert into descriptions (description)
      values (${JSON.stringify(finalDescription)})
    `;
    return id;
  },

  update(
    db: DataWriter,
    id: DescriptionId,
    description: BlockElementInput[]
  ): boolean {
    const finalDescription = validateDescription(description, ignoreLinkRefs);

    const {affectedRows} = db.exec`
      update descriptions
      set description = ${JSON.stringify(finalDescription)}
      where id = ${id}
    `;
    db.clearCache(Description.rawByIdKey, id);

    return affectedRows > 0;
  },

  delete(db: DataWriter, id: DescriptionId): boolean {
    const {affectedRows} = db.exec`
      delete from descriptions
      where id = ${id}
    `;
    return affectedRows > 0;
  },
} as const;

export {DescriptionMut};
