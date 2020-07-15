import {DefinitionId} from '../../graphql/types';

import {validateTag} from '../tag/validators';

import Mutator from '../mutator';

export default class DefinitionTagMut extends Mutator {
  public insertAll(definitionId: DefinitionId, tags: string[]): void {
    const {db} = this;
    const {TagMut} = this.mut;

    const tagToId = TagMut.ensureAllExist(tags.map(validateTag));

    if (tagToId.size > 0) {
      const tagIds = Array.from(tagToId.values());

      db.exec`
        insert into definition_tags (definition_id, tag_id)
        values ${tagIds.map(id => db.raw`(${definitionId}, ${id})`)}
      `;
    }
  }

  public update(definitionId: DefinitionId, tags: string[]): void {
    const {TagMut} = this.mut;

    // We could compute a delta here, but it's kind of messy and complex, and
    // this all happens inside a transaction anyway.
    this.deleteAll(definitionId);
    this.insertAll(definitionId, tags);

    // This may have orphaned a number of tags, so we need to delete those.
    TagMut.deleteOrphaned();
  }

  private deleteAll(definitionId: DefinitionId): void {
    this.db.exec`
      delete from definition_tags
      where definition_id = ${definitionId}
    `;
  }
}
