import {validateTag} from '../tag/validators';

import Mutator from '../mutator';

export default class DefinitionTagMut extends Mutator {
  public async insertAll(definitionId: number, tags: string[]): Promise<void> {
    const {db} = this;
    const {TagMut} = this.mut;

    const tagToId = await TagMut.ensureAllExist(tags.map(validateTag));

    if (tagToId.size > 0) {
      const tagIds = Array.from(tagToId.values());

      await db.exec`
        insert into definition_tags (definition_id, tag_id)
        values ${tagIds.map(id => db.raw`(${definitionId}, ${id})`)}
      `;
    }
  }

  public async update(definitionId: number, tags: string[]): Promise<void> {
    const {TagMut} = this.mut;

    // We could compute a delta here, but it's kind of messy and complex, and
    // this all happens inside a transaction anyway.
    await this.deleteAll(definitionId);
    await this.insertAll(definitionId, tags);

    // This may have orphaned a number of tags, so we need to delete those.
    await TagMut.deleteOrphaned();
  }

  private async deleteAll(definitionId: number): Promise<void> {
    await this.db.exec`
      delete from definition_tags
      where definition_id = ${definitionId}
    `;
  }
}
