import {LemmaId, LanguageId} from '../../graphql';
import {DataWriter} from '../../database';

import {SearchIndexMut} from '../search-index';

import {Lemma} from './model';
import {ValidTerm} from './validators';

const LemmaMut = {
  ensureExists(
    db: DataWriter,
    languageId: LanguageId,
    term: ValidTerm
  ): LemmaId {
    const result = db.get<{id: LemmaId}>`
      select id
      from lemmas
      where language_id = ${languageId}
        and term = ${term}
    `;
    if (result) {
      return result.id;
    }

    const {insertId} = db.exec<LemmaId>`
      insert into lemmas (language_id, term)
      values (${languageId}, ${term})
    `;
    SearchIndexMut.insertLemma(db, insertId, term);
    this.updateLemmaCount(db, languageId);
    return insertId;
  },

  ensureAllExist(
    db: DataWriter,
    languageId: LanguageId,
    terms: ValidTerm[]
  ): Map<string, LemmaId> {
    type Row = {
      id: LemmaId;
      term: string;
    };

    if (terms.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return new Map();
    }

    const result = db.all<Row>`
      select
        id,
        term
      from lemmas
      where language_id = ${languageId}
        and term in (${terms})
    `;
    const termToId = new Map<string, LemmaId>(
      result.map<[string, LemmaId]>(row => [row.term, row.id])
    );

    const newTerms = terms.filter(t => !termToId.has(t));
    if (newTerms.length > 0) {
      const newLemmas = db.all<Row>`
        insert into lemmas (language_id, term)
        values ${newTerms.map(t => db.raw`(${languageId}, ${t})`)}
        returning id, term
      `;

      SearchIndexMut.insertLemmas(db, newLemmas);

      // At least one term was inserted, so we need to update the count.
      this.updateLemmaCount(db, languageId);

      for (const lemma of newLemmas) {
        termToId.set(lemma.term, lemma.id);
      }
    }

    return termToId;
  },

  deleteEmpty(db: DataWriter, languageId: LanguageId): void {
    const deleted = db.all<{id: LemmaId}>`
      with empty_lemmas(id) as (
        select l.id as id
        from lemmas l
        left join definitions d on d.lemma_id = l.id
        left join derived_definitions dd on dd.lemma_id = l.id
        where l.languages_id = ${languageId}
          and d.id is null
          and dd.original_definition_id is null
      )
      delete from lemmas
      where id in (select id from empty_lemmas)
      returning id
    `;

    if (deleted.length > 0) {
      const ids = deleted.map(d => d.id);

      for (const id of ids) {
        db.clearCache(Lemma.byIdKey, id);
      }

      SearchIndexMut.deleteLemmas(db, ids);

      this.updateLemmaCount(db, languageId);
    }
  },

  updateLemmaCount(db: DataWriter, languageId: LanguageId): void {
    db.exec`
      update languages
      set lemma_count = (
        select count(*)
        from lemmas
        where language_id = ${languageId}
      )
      where id = ${languageId}
    `;
  },
} as const;

export {LemmaMut};
