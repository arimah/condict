import {DataWriter} from '../../database';
import {
  LanguageId,
  LemmaId,
  DefinitionId,
  PartOfSpeechId,
  TagId,
} from '../../graphql';
import {BlockElementJson, InlineElementJson} from '../../rich-text';

import {LemmaSearchIndexInput, TagSearchIndexInput} from './types';

const SearchIndexMut = {
  insertLanguage(db: DataWriter, id: LanguageId, name: string): void {
    db.exec`
      insert into languages_fts (rowid, name)
      values (${id}, ${name})
    `;
  },

  updateLanguage(db: DataWriter, id: LanguageId, name: string): void {
    db.exec`
      update languages_fts
      set name = ${name}
      where rowid = ${id}
    `;
  },

  deleteLanguage(db: DataWriter, id: LanguageId): void {
    db.exec`
      delete from languages_fts
      where rowid = ${id}
    `;
  },

  insertLemma(db: DataWriter, id: LemmaId, term: string): void {
    db.exec`
      insert into lemmas_fts (rowid, term)
      values (${id}, ${term})
    `;
  },

  insertLemmas(db: DataWriter, lemmas: LemmaSearchIndexInput[]): void {
    db.exec`
      insert into lemmas_fts (rowid, term)
      values ${lemmas.map(lm => db.raw`(${lm.id}, ${lm.term})`)}
    `;
  },

  updateLemma(db: DataWriter, id: LemmaId, term: string): void {
    db.exec`
      update lemmas_fts
      set term = ${term}
      where rowid = ${id}
    `;
  },

  deleteLemmas(db: DataWriter, ids: readonly LemmaId[]): void {
    db.exec`
      delete from lemmas_fts
      where rowid in (${ids})
    `;
  },

  deleteAllLemmasInLanguage(db: DataWriter, languageId: LanguageId) {
    db.exec`
      delete from lemmas_fts
      where rowid in (
        select id
        from lemmas
        where language_id = ${languageId}
      )
    `;
  },

  insertDefinition(
    db: DataWriter,
    id: DefinitionId,
    description: readonly BlockElementJson[]
  ): void {
    const plainTextDescription = richTextToPlainText(description);
    db.exec`
      insert into definitions_fts (rowid, description)
      values (${id}, ${plainTextDescription})
    `;
  },

  updateDefinition(
    db: DataWriter,
    id: DefinitionId,
    description: readonly BlockElementJson[]
  ): void {
    const plainTextDescription = richTextToPlainText(description);
    db.exec`
      update definitions_fts
      set description = ${plainTextDescription}
      where rowid = ${id}
    `;
  },

  deleteDefinition(db: DataWriter, id: DefinitionId): void {
    db.exec`
      delete from definitions_fts
      where rowid = ${id}
    `;
  },

  deleteAllDefinitionsInLanguage(db: DataWriter, languageId: LanguageId): void {
    db.exec`
      delete from definitions_fts
      where rowid in (
        select id
        from definitions
        where language_id = ${languageId}
      )
    `;
  },

  insertPartOfSpeech(db: DataWriter, id: PartOfSpeechId, name: string): void {
    db.exec`
      insert into parts_of_speech_fts (rowid, name)
      values (${id}, ${name})
    `;
  },

  updatePartOfSpeech(db: DataWriter, id: PartOfSpeechId, name: string): void {
    db.exec`
      update parts_of_speech_fts
      set name = ${name}
      where rowid = ${id}
    `;
  },

  deletePartOfSpeech(db: DataWriter, id: PartOfSpeechId): void {
    db.exec`
      delete from parts_of_speech_fts
      where rowid = ${id}
    `;
  },

  deleteAllPartsOfSpeechInLanguage(
    db: DataWriter,
    languageId: LanguageId
  ): void {
    db.exec`
      delete from parts_of_speech_fts
      where rowid in (
        select id
        from parts_of_speech
        where language_id = ${languageId}
      )
    `;
  },

  insertTags(db: DataWriter, tags: TagSearchIndexInput[]): void {
    db.exec`
      insert into tags_fts (rowid, name)
      values ${tags.map(t => db.raw`(${t.id}, ${t.name})`)}
    `;
  },

  deleteTags(db: DataWriter, ids: readonly TagId[]): void {
    db.exec`
      delete from tags_fts
      where rowid in (${ids})
    `;
  },
} as const;

const richTextToPlainText = (richText: readonly BlockElementJson[]): string => {
  const lines: string[] = [];

  for (const block of richText) {
    let texts: string[] = [];

    for (const inline of block.inlines) {
      if (InlineElementJson.isLink(inline)) {
        texts = texts.concat(inline.inlines.map(t => t.text));
      } else {
        texts.push(inline.text);
      }
    }

    lines.push(texts.join(''));
  }

  return lines.join('\n');
};

export {SearchIndexMut};
