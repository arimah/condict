import {LemmaId, LanguageId} from '../../graphql';
import {DataWriter} from '../../database';

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
    this.updateLemmaCount(db, languageId);
    return insertId;
  },

  ensureAllExist(
    db: DataWriter,
    languageId: LanguageId,
    terms: ValidTerm[]
  ): Map<string, LemmaId> {
    // FIXME: https://github.com/typescript-eslint/typescript-eslint/issues/2452
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    let hasNewTerms = false;
    for (const term of terms) {
      // TODO: Can we parallelise this? Auto-increment IDs *should* be serial.
      if (!termToId.has(term)) {
        const {insertId} = db.exec<LemmaId>`
          insert into lemmas (language_id, term)
          values (${languageId}, ${term})
        `;
        termToId.set(term, insertId);
        hasNewTerms = true;
      }
    }

    if (hasNewTerms) {
      // At least one term was inserted, so we need to update the count.
      this.updateLemmaCount(db, languageId);
    }

    return termToId;
  },

  deleteEmpty(db: DataWriter, languageId: LanguageId): void {
    const emptyIds = db.all<{id: LemmaId}>`
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

      db.exec`
        delete from lemmas
        where id in (${emptyIds.map(row => row.id)})
      `;
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
