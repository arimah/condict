import Mutator from '../mutator';

import {TagRow} from './types';
import {ValidTag} from './validators';

class TagMut extends Mutator {
  public async ensureAllExist(tags: ValidTag[]): Promise<Map<string, number>> {
    const {db} = this;

    if (tags.length === 0) {
      // Nothing to do
      return new Map();
    }

    const result = await db.all<TagRow>`
      select *
      from tags
      where name in (${tags.map(t => t.tag)})
    `;
    const tagToId = new Map<string, number>(
      result.map<[string, number]>(row => [row.name, row.id])
    );

    for (const {tag} of tags) {
      // TODO: Can we parallelise this? Auto-increment IDs *should* be serial.
      if (!tagToId.has(tag)) {
        const {insertId} = await db.exec`
          insert into tags (name)
          values (${tag})
        `;
        tagToId.set(tag, insertId);
      }
    }

    return tagToId;
  }

  public async deleteOrphaned(): Promise<void> {
    const {db} = this;
    const {Tag} = this.model;

    const emptyIds = await db.all<{id: number}>`
      select t.id
      from tags t
      left join definition_tags dt on dt.tag_id = t.id
      where dt.definition_id is null
      group by t.id
    `;

    if (emptyIds.length > 0) {
      emptyIds.forEach(row => db.clearCache(Tag.byIdKey, row.id));

      await db.exec`
        delete from tags
        where id in (${emptyIds.map(row => row.id)})
      `;
    }
  }
}

export default {TagMut};
