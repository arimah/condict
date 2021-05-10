import {DataWriter} from '../../database';
import {TagId} from '../../graphql';

import {SearchIndexMut} from '../search-index';

import {Tag} from './model';
import {ValidTag} from './validators';

const TagMut = {
  ensureAllExist(db: DataWriter, tags: ValidTag[]): Map<string, TagId> {
    type Row = {
      id: TagId;
      name: string;
    };

    if (tags.length === 0) {
      // Nothing to do
      return new Map<string, TagId>();
    }

    const result = db.all<Row>`
      select id, name
      from tags
      where name in (${tags})
    `;
    const tagToId = new Map<string, TagId>(
      result.map(row => [row.name, row.id])
    );

    const newNames = tags.filter(t => !tagToId.has(t));
    if (newNames.length > 0) {
      const newTags = db.all<Row>`
        insert into tags (name)
        values ${newNames.map(n => db.raw`(${n})`)}
        returning id, name
      `;

      for (const tag of newTags) {
        tagToId.set(tag.name, tag.id);
      }

      SearchIndexMut.insertTags(db, newTags);
    }

    return tagToId;
  },

  deleteOrphaned(db: DataWriter): void {
    const deleted = db.all<{id: TagId}>`
      with orphaned_tags(id) as (
        select t.id
        from tags t
        left join definition_tags dt on dt.tag_id = t.id
        where dt.definition_id is null
        group by t.id
      )
      delete from tags
      where id in (select id from orphaned_tags)
      returning id
    `;

    if (deleted.length > 0) {
      const ids = deleted.map(d => d.id);

      for (const id of ids) {
        db.clearCache(Tag.byIdKey, id);
      }

      SearchIndexMut.deleteTags(db, ids);
    }
  },
} as const;

export {TagMut};
