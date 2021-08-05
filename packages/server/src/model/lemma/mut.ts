import {LemmaId, LanguageId} from '../../graphql';
import {DataWriter} from '../../database';

import {SearchIndexMut} from '../search-index';
import {WriteContext} from '../types';

import {Lemma} from './model';
import {ValidTerm} from './validators';

const LemmaMut = {
  ensureExists(
    context: WriteContext,
    languageId: LanguageId,
    term: ValidTerm
  ): LemmaId {
    const {db, events, logger} = context;
    const result = db.get<{id: LemmaId}>`
      select id
      from lemmas
      where language_id = ${languageId}
        and term = ${term}
    `;
    if (result) {
      logger.debug('Found existing lemma');
      return result.id;
    }

    const {insertId} = db.exec<LemmaId>`
      insert into lemmas (language_id, term)
      values (${languageId}, ${term})
    `;

    SearchIndexMut.insertLemma(db, insertId, term);
    this.updateLemmaCount(db, languageId);

    events.emit({type: 'lemma', action: 'create', id: insertId, languageId});
    logger.debug('Created lemma for new term');
    return insertId;
  },

  ensureAllExist(
    context: WriteContext,
    languageId: LanguageId,
    terms: ValidTerm[]
  ): Map<string, LemmaId> {
    type Row = {
      id: LemmaId;
      term: string;
    };

    const {db, events, logger} = context;
    if (terms.length === 0) {
      logger.debug('No terms given for bulk creation of lemmas');
      return new Map<string, LemmaId>();
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
        events.emit({
          type: 'lemma',
          action: 'create',
          id: lemma.id,
          languageId,
        });
      }
    }

    const created = newTerms.length;
    const existing = terms.length - created;
    logger.debug(
      `Bulk creation of lemmas: ${created} created, ${existing} existing`
    );

    return termToId;
  },

  deleteEmpty(context: WriteContext, languageId: LanguageId): void {
    const {db, events, logger} = context;
    const deleted = db.all<{id: LemmaId}>`
      with empty_lemmas(id) as (
        select l.id as id
        from lemmas l
        left join definitions d on d.lemma_id = l.id
        left join derived_definitions dd on dd.lemma_id = l.id
        where l.language_id = ${languageId}
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
        events.emit({type: 'lemma', action: 'delete', id, languageId});
      }

      SearchIndexMut.deleteLemmas(db, ids);

      logger.debug(`Deleted empty lemmas: count = ${ids.length}`);

      this.updateLemmaCount(db, languageId);
    }
  },

  deleteAllInLanguage(db: DataWriter, languageId: LanguageId): void {
    // Delete from the search index first; otherwise we can't know which lemmas
    // belong to the language.
    SearchIndexMut.deleteAllLemmasInLanguage(db, languageId);

    db.exec`
      delete from lemmas
      where language_id = ${languageId}
    `;
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
