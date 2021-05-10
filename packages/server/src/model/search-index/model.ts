import {GraphQLResolveInfo} from 'graphql';

import {DataReader, RawSql} from '../../database';
import {
  SearchScope,
  MatchingSnippet,
  MatchingSnippetPart,
  PageParams,
  validatePageParams,
} from '../../graphql';

import paginate from '../paginate';
import {ItemConnection} from '../types';

import {ScopeSql, AllScopes, findValidScopes, buildSearchSql} from './scopes';
import {MatchStart, MatchEnd, Partial} from './snippet';
import formatFtsQuery from './query';
import {SearchResultRow, SearchFilters} from './types';

const formatCountQuery = (part: ScopeSql): RawSql =>
  new RawSql(
    `select count(*) as total ${part.fromJoinWhere.sql}`,
    part.fromJoinWhere.params
  );

const formatDataQuery = (part: ScopeSql): RawSql =>
  new RawSql(
    `select ${part.fields.sql} ${part.fromJoinWhere.sql}`,
    [...part.fields.params, ...part.fromJoinWhere.params]
  );

const SearchIndex = {
  defaultPagination: {
    page: 0,
    perPage: 50,
  },
  maxPerPage: 200,

  search(
    db: DataReader,
    query: string,
    scopes: readonly SearchScope[] | null,
    filters: SearchFilters,
    page: PageParams | undefined | null,
    info?: GraphQLResolveInfo
  ): ItemConnection<SearchResultRow> {
    page = validatePageParams(page || this.defaultPagination, this.maxPerPage);

    // First step: figure out which scopes we can search given the input scopes
    // and current filters.
    const validScopes = findValidScopes(scopes ?? AllScopes, filters);
    const ftsQuery = formatFtsQuery(query);

    if (
      // Empty query = empty result.
      !ftsQuery ||
      // No scopes = nothing to search.
      validScopes.size === 0 ||
      // Languages specified but empty = no language to search.
      filters.inLanguages && filters.inLanguages.length === 0 ||
      // Parts of speech specified but empty = no language to search.
      filters.inPartsOfSpeech && filters.inPartsOfSpeech.length === 0 ||
      // Tags specified but empty *and* tagMatching is MATCH_ANY = no tags to
      // filter by.
      // NB: MATCH_ALL always succeeds against `[]` because `[]` is a subset
      // of every list.
      filters.withTags &&
        filters.withTags.length === 0 &&
        filters.tagMatching === 'MATCH_ANY'
    ) {
      return {
        page: {
          page: page.page,
          perPage: page.perPage,
          totalCount: 0,
        },
        nodes: [],
      };
    }

    const sqlParts = buildSearchSql(db, ftsQuery, validScopes, filters);

    return paginate(
      page,
      () => {
        const {total} = db.getRequired<{total: number}>`
          select sum(total) as total
          from (${RawSql.join(sqlParts.map(formatCountQuery), ' union all ')}) t
        `;
        return total;
      },
      (limit, offset) => db.all<SearchResultRow>`
        ${RawSql.join(sqlParts.map(formatDataQuery), ' union all ')}
        order by score
        limit ${limit} offset ${offset}
      `,
      info
    );
  },
} as const;

const MatchingSnippet = {
  fromRaw(text: string): MatchingSnippet {
    const partialStart = text.startsWith(Partial);
    const partialEnd = text.endsWith(Partial);

    // If partialStart, the first part starts past the Partial marker.
    let index = partialStart ? Partial.length : 0;
    // If partialEnd, the last part ends before the Partial marker.
    const end = text.length - (partialEnd ? Partial.length : 0);

    const parts: MatchingSnippetPart[] = [];

    while (index < end) {
      const matchStart = text.indexOf(MatchStart, index);
      if (matchStart !== -1) {
        if (index < matchStart) {
          parts.push({
            isMatch: false,
            text: text.slice(index, matchStart),
          });
        }

        const matchEnd = text.indexOf(MatchEnd, matchStart + MatchStart.length);
        parts.push({
          isMatch: true,
          text: text.slice(matchStart + MatchStart.length, matchEnd),
        });

        index = matchEnd + MatchEnd.length;
      } else {
        parts.push({
          isMatch: false,
          text: text.slice(index, end),
        });
        // No more matches are possible.
        break;
      }
    }

    return {partialStart, partialEnd, parts};
  },
} as const;

export {SearchIndex, MatchingSnippet};
