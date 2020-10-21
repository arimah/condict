import {Connection} from '../../database';
import {DefinitionId} from '../../graphql';

import {TagMut, validateTag} from '../tag';

const DefinitionTagMut = {
  insertAll(db: Connection, definitionId: DefinitionId, tags: string[]): void {
    const tagToId = TagMut.ensureAllExist(db, tags.map(validateTag));

    if (tagToId.size > 0) {
      const tagIds = Array.from(tagToId.values());

      db.exec`
        insert into definition_tags (definition_id, tag_id)
        values ${tagIds.map(id => db.raw`(${definitionId}, ${id})`)}
      `;
    }
  },

  update(db: Connection, definitionId: DefinitionId, tags: string[]): void {
    // We could compute a delta here, but it's kind of messy and complex, and
    // this all happens inside a transaction anyway.
    this.deleteAll(db, definitionId);
    this.insertAll(db, definitionId, tags);

    // This may have orphaned a number of tags, so we need to delete those.
    TagMut.deleteOrphaned(db);
  },

  deleteAll(db: Connection, definitionId: DefinitionId): void {
    db.exec`
      delete from definition_tags
      where definition_id = ${definitionId}
    `;
  },
};

export default DefinitionTagMut;
