import Mutator from '../mutator';

import {validateTerm} from './validators';

class LemmaMut extends Mutator {
  public async ensureExists(languageId: number, term: string) {
    const {db} = this;

    term = validateTerm(term);

    const result = await db.get<{id: number}>`
      select id
      from lemmas
      where language_id = ${languageId}
        and term_unique = ${term}
    `;
    if (result) {
      return result.id;
    }

    const {insertId} = await db.exec`
      insert into lemmas (language_id, term_unique, term_display)
      values (${languageId}, ${term}, ${term})
    `;
    await this.updateLemmaCount(languageId);
    return insertId;
  }

  public async deleteEmpty(languageId: number) {
    const {db} = this;
    const {Lemma} = this.model;

    const emptyIds = await db.all<{id: number}>`
      select l.id as id
      from lemmas l
      left join definitions d on d.lemma_id = l.id
      left join derived_definitions dd on dd.lemma_id = l.id
      where l.language_id = ${languageId}
        and d.id is null
        and dd.original_definition_id is null
    `;

    if (emptyIds.length > 0) {
      emptyIds.forEach(row => db.clearCache(Lemma.byIdKey, row.id));

      await db.exec`
        delete from lemmas
        where id in (${emptyIds.map(row => row.id)})
      `;
      await this.updateLemmaCount(languageId);
    }
  }

  private updateLemmaCount(languageId: number) {
    return this.db.exec`
      update languages
      set lemma_count = (
        select count(*)
        from lemmas
        where language_id = ${languageId}
      )
      where id = ${languageId}
    `;
  }
}

export default {LemmaMut};
