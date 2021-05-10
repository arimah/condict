import {DataWriter} from '../../database';
import {LinkRefCollector, validateDescription} from '../../rich-text';
import {BlockElementInput} from '../../graphql';

import {Description} from './model';
import {DescriptionId, DescriptionData} from './types';

const ignoreLinkRefs: LinkRefCollector = () => { /* no-op */ };

const DescriptionMut = {
  insert(
    db: DataWriter,
    description: BlockElementInput[]
  ): DescriptionData {
    const finalDescription = validateDescription(description, ignoreLinkRefs);

    const {insertId: id} = db.exec<DescriptionId>`
      insert into descriptions (description)
      values (${JSON.stringify(finalDescription)})
    `;
    return {id, description: finalDescription};
  },

  update(
    db: DataWriter,
    id: DescriptionId,
    description: BlockElementInput[]
  ): DescriptionData {
    const finalDescription = validateDescription(description, ignoreLinkRefs);

    db.exec`
      update descriptions
      set description = ${JSON.stringify(finalDescription)}
      where id = ${id}
    `;
    db.clearCache(Description.rawByIdKey, id);

    return {id, description: finalDescription};
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
