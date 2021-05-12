import {SearchScope} from '../../graphql';

import {DataReader, RawSql} from '../../database';

import {Partial, MatchStart, MatchEnd} from './snippet';
import {SearchFilters} from './types';

export interface ScopeSql {
  /**
   * Field selections for this scope. Includes everything between `select` and
   * `from`.
   */
  readonly fields: RawSql;
  /**
   * The `from` part, `join`s, and `where` clause as necessary, including the
   * leading `from`.
   */
  readonly fromJoinWhere: RawSql;
}

interface ScopeInfo {
  readonly acceptsLanguageFilter?: boolean;
  readonly acceptsPartOfSpeechFilter?: boolean;
  readonly acceptsTagFilter?: boolean;
  readonly buildSql: ScopeQueryGenerator;
}

type ScopeQueryGenerator = (
  db: DataReader,
  ftsQuery: string,
  filters: SearchFilters
) => ScopeSql;

export const AllScopes: readonly SearchScope[] = [
  'SEARCH_LANGUAGES',
  'SEARCH_LEMMAS',
  'SEARCH_DEFINITIONS',
  'SEARCH_PARTS_OF_SPEECH',
  'SEARCH_TAGS',
];

/**
 * Shared arguments to the snippet() function.
 * text before match, text after match, start/end partial, max tokens
 */
const SnippetArgs = new RawSql(
  `'${MatchStart}', '${MatchEnd}', '${Partial}', 32`,
  []
);

const EmptySql = new RawSql('', []);

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const AllScopeInfo: Record<SearchScope, ScopeInfo> = {
  SEARCH_LANGUAGES: {
    buildSql(db, ftsQuery) {
      return {
        fields: db.raw`
          'language' as kind,
          lng.id as id,
          snippet(languages_fts, 0, ${SnippetArgs}) as matching_snippet,
          languages_fts.rank as score
        `,
        fromJoinWhere: db.raw`
          from languages_fts
          inner join languages lng on lng.id = languages_fts.rowid
          where languages_fts match ${ftsQuery}
        `,
      };
    },
  },
  SEARCH_LEMMAS: {
    acceptsLanguageFilter: true,
    acceptsPartOfSpeechFilter: true,
    acceptsTagFilter: true,
    buildSql(db, ftsQuery, filters) {
      const needTagFilter = filters.withTags && filters.withTags.length > 0;
      return {
        fields: db.raw`
          'lemma' as kind,
          lm.id as id,
          snippet(lemmas_fts, 0, ${SnippetArgs}) as matching_snippet,
          lemmas_fts.rank as score
        `,
        fromJoinWhere: db.raw`
          from lemmas_fts
          inner join lemmas lm on lm.id = lemmas_fts.rowid
          ${needTagFilter
            ? db.raw`inner join (
              select
                d.lemma_id as lemma_id,
                count(distinct dt.tag_id) as tag_count
              from definition_tags dt
              inner join definitions d on d.id = dt.definition_id
              where dt.tag_id in (${filters.withTags})
              group by d.lemma_id
            ) tc on tc.lemma_id = lm.id`
            : EmptySql}
          where lemmas_fts match ${ftsQuery}
          ${filters.inLanguages
            ? db.raw`and lm.language_id in (${filters.inLanguages})`
            : EmptySql}
          ${filters.inPartsOfSpeech
            ? db.raw`and exists(
              select 1
              from definitions d
              where d.lemma_id = lm.id
                and d.part_of_speech_id in (${filters.inPartsOfSpeech})
            )`
            : EmptySql}
          ${needTagFilter && filters.tagMatching === 'MATCH_ALL'
            ? db.raw`and tc.tag_count = ${filters.withTags!.length}`
            : EmptySql}
        `,
      };
    },
  },
  SEARCH_DEFINITIONS: {
    acceptsLanguageFilter: true,
    acceptsPartOfSpeechFilter: true,
    acceptsTagFilter: true,
    buildSql(db, ftsQuery, filters) {
      const needTagFilter = filters.withTags && filters.withTags.length > 0;
      return {
        fields: db.raw`
          'definition' as kind,
          d.id as id,
          snippet(definitions_fts, 0, ${SnippetArgs}) as matching_snippet,
          definitions_fts.rank as score
        `,
        fromJoinWhere: db.raw`
          from definitions_fts
          inner join definitions d on d.id = definitions_fts.rowid
          ${needTagFilter
            ? db.raw`inner join (
              select
                dt.definition_id as definition_id,
                count(dt.tag_id) as tag_count
              from definition_tags dt
              where dt.tag_id in (${filters.withTags})
              group by dt.definition_id
            ) tc on tc.definition_id = d.id`
            : EmptySql}
          where definitions_fts match ${ftsQuery}
          ${filters.inLanguages
            ? db.raw`and d.language_id in (${filters.inLanguages})`
            : EmptySql}
          ${filters.inPartsOfSpeech
            ? db.raw`and d.part_of_speech_id in (${filters.inPartsOfSpeech})`
            : EmptySql}
          ${needTagFilter && filters.tagMatching === 'MATCH_ALL'
            ? db.raw`and tc.tag_count = ${filters.withTags!.length}`
            : EmptySql}
        `,
      };
    },
  },
  SEARCH_PARTS_OF_SPEECH: {
    acceptsLanguageFilter: true,
    buildSql(db, ftsQuery, filters) {
      return {
        fields: db.raw`
          'part_of_speech' as kind,
          pos.id as id,
          snippet(parts_of_speech_fts, 0, ${SnippetArgs}) as matching_snippet,
          parts_of_speech_fts.rank as score
        `,
        fromJoinWhere: db.raw`
          from parts_of_speech_fts
          inner join parts_of_speech pos on pos.id = parts_of_speech_fts.rowid
          where parts_of_speech_fts match ${ftsQuery}
          ${filters.inLanguages
            ? db.raw`and pos.language_id in (${filters.inLanguages})`
            : EmptySql}
        `,
      };
    },
  },
  SEARCH_TAGS: {
    buildSql(db, ftsQuery) {
      return {
        fields: db.raw`
          'tag' as kind,
          t.id as id,
          snippet(tags_fts, 0, ${SnippetArgs}) as matching_snippet,
          tags_fts.rank as score
        `,
        fromJoinWhere: db.raw`
          from tags_fts
          inner join tags t on t.id = tags_fts.rowid
          where tags_fts match ${ftsQuery}
        `,
      };
    },
  },
};
/* eslint-enable @typescript-eslint/no-non-null-assertion */

export const findValidScopes = (
  scopes: readonly SearchScope[],
  filters: SearchFilters
): Set<SearchScope> =>
  new Set(scopes.filter(scope => {
    const scopeInfo = AllScopeInfo[scope];
    return (
      (!filters.inLanguages || scopeInfo.acceptsLanguageFilter) &&
      (!filters.inPartsOfSpeech || scopeInfo.acceptsPartOfSpeechFilter) &&
      (!filters.withTags || scopeInfo.acceptsTagFilter)
    );
  }));

export const buildSearchSql = (
  db: DataReader,
  ftsQuery: string,
  scopes: Set<SearchScope>,
  filters: SearchFilters
): ScopeSql[] => {
  const result: ScopeSql[] = [];

  for (const scope of scopes) {
    const scopeInfo = AllScopeInfo[scope];
    result.push(scopeInfo.buildSql(db, ftsQuery, filters));
  }

  return result;
};
