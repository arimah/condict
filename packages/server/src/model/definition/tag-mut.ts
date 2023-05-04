import {DataWriter} from '../../database';
import {DefinitionId, TagId} from '../../graphql';

import {TagMut, validateTag} from '../tag';
import {WriteContext} from '../types';

const DefinitionTagMut = {
  insertAll(
    context: WriteContext,
    definitionId: DefinitionId,
    tags: string[]
  ): TagId[] {
    const {db} = context;
    const tagToId = TagMut.ensureAllExist(context, tags.map(validateTag));

    if (tagToId.size > 0) {
      const tagIds = Array.from(tagToId.values());

      db.exec`
        insert into definition_tags (definition_id, tag_id)
        values ${tagIds.map(id => db.raw`(${definitionId}, ${id})`)}
      `;
      return tagIds;
    }
    return [];
  },

  update(
    context: WriteContext,
    definitionId: DefinitionId,
    tags: string[]
  ): [prev: TagId[], next: TagId[]] {
    const {db} = context;
    // We could compute a delta here, but it's kind of messy and complex, and
    // this all happens inside a transaction anyway.
    const prevTagIds = this.deleteAll(db, definitionId);
    const nextTagIds = this.insertAll(context, definitionId, tags);

    // This may have orphaned a number of tags, so we need to delete those.
    TagMut.deleteOrphaned(context);

    return [prevTagIds, nextTagIds];
  },

  deleteAll(db: DataWriter, definitionId: DefinitionId): TagId[] {
    const rows = db.all<{tag_id: TagId}>`
      delete from definition_tags
      where definition_id = ${definitionId}
      returning tag_id
    `;
    return rows.map(r => r.tag_id);
  },
};

export default DefinitionTagMut;
