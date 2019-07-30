import Mutator from '../mutator';
import {LanguageId} from '../language/types';

import {LemmaId} from './types';
import {ValidTerm} from './validators';

class LemmaMut extends Mutator {
  public async ensureExists(languageId: LanguageId, term: ValidTerm): Promise<LemmaId> {
    const {db} = this;

    const result = await db.get<{id: LemmaId}>`
      select id
      from lemmas
      where language_id = ${languageId}
        and term_unique = ${term}
    `;
    if (result) {
      return result.id;
    }

    const {insertId} = await db.exec<LemmaId>`
      insert into lemmas (language_id, term_unique, term_display)
      values (${languageId}, ${term}, ${term})
    `;
    await this.updateLemmaCount(languageId);
    return insertId;
  }

  public async ensureAllExist(
    languageId: LanguageId,
    terms: ValidTerm[]
  ): Promise<Map<string, LemmaId>> {
    interface Row {
      id: LemmaId;
      term: string;
    }

    const {db} = this;

    if (terms.length === 0) {
      return new Map();
    }

    const result = await db.all<Row>`
      select
        id,
        term_unique as term
      from lemmas
      where language_id = ${languageId}
        and term_unique in (${terms})
    `;
    const termToId = new Map<string, LemmaId>(
      result.map<[string, LemmaId]>(row => [row.term, row.id])
    );

    for (const term of terms) {
      // TODO: Can we parallelise this? Auto-increment IDs *should* be serial.
      if (!termToId.has(term)) {
        const {insertId} = await db.exec<LemmaId>`
          insert into lemmas (language_id, term_unique, term_display)
          values (${languageId}, ${term}, ${term})
        `;
        termToId.set(term, insertId);
      }
    }

    if (termToId.size !== terms.length) {
      // At least one term was inserted, so we need to update the count.
      await this.updateLemmaCount(languageId);
    }

    return termToId;
  }

  public async deleteEmpty(languageId: LanguageId): Promise<void> {
    const {db} = this;
    const {Lemma} = this.model;

    const emptyIds = await db.all<{id: LemmaId}>`
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

  private async updateLemmaCount(languageId: LanguageId): Promise<void> {
    await this.db.exec`
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
