import {Connection} from '../../database';
import {TagId} from '../../graphql/types';

import {Tag} from './model';
import {TagRow} from './types';
import {ValidTag} from './validators';

const TagMut = {
  ensureAllExist(db: Connection, tags: ValidTag[]): Map<string, TagId> {
    if (tags.length === 0) {
      // Nothing to do
      return new Map<string, TagId>();
    }

    const result = db.all<TagRow>`
      select *
      from tags
      where name in (${tags})
    `;
    const tagToId = new Map<string, TagId>(
      result.map(row => [row.name, row.id])
    );

    for (const tag of tags) {
      // TODO: Can we parallelise this? Auto-increment IDs *should* be serial.
      if (!tagToId.has(tag)) {
        const {insertId} = db.exec<TagId>`
          insert into tags (name)
          values (${tag})
        `;
        tagToId.set(tag, insertId);
      }
    }

    return tagToId;
  },

  deleteOrphaned(db: Connection): void {
    const emptyIds = db.all<{id: TagId}>`
      select t.id
      from tags t
      left join definition_tags dt on dt.tag_id = t.id
      where dt.definition_id is null
      group by t.id
    `;

    if (emptyIds.length > 0) {
      emptyIds.forEach(row => db.clearCache(Tag.byIdKey, row.id));

      db.exec`
        delete from tags
        where id in (${emptyIds.map(row => row.id)})
      `;
    }
  },
} as const;

export {TagMut};
