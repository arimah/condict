import {GraphQLResolveInfo} from 'graphql';

import {DataReader} from '../../database';
import {
  LanguageId,
  DefinitionId,
  PartOfSpeechId,
  InflectionTableId,
  RecentItemOrder,
  PageParams,
  validatePageParams,
} from '../../graphql';

import {Language} from '../language';
import {Definition} from '../definition';
import {PartOfSpeech} from '../part-of-speech';
import {InflectionTable} from '../inflection-table';
import paginate from '../paginate';
import {ItemConnection} from '../types';

import {RawRecentItemRow, RecentItemRow} from './types';

const RecentChanges = {
  defaultPagination: {
    page: 0,
    perPage: 25,
  },
  maxPerPage: 100,

  async get(
    db: DataReader,
    page: PageParams | undefined | null,
    order: RecentItemOrder | undefined | null,
    info?: GraphQLResolveInfo
  ): Promise<ItemConnection<RecentItemRow>> {
    const sortColumn = order === 'MOST_RECENTLY_CREATED'
      ? db.raw`time_created`
      : db.raw`time_updated`;

    const {page: pageInfo, nodes} = paginate(
      validatePageParams(page ?? this.defaultPagination, this.maxPerPage),
      () => {
        const {total} = db.getRequired<{total: number}>`
          select
            sum(t.total) as total
          from (
            select count(*) as total from languages
            union all
            select count(*) from definitions
            union all
            select count(*) from parts_of_speech
            union all
            select count(*) from inflection_tables
          ) t
        `;
        return total;
      },
      (limit, offset) => db.all<RawRecentItemRow>`
        select id, 'language' as type, ${sortColumn} from languages
        union all
        select id, 'definition', ${sortColumn} from definitions
        union all
        select id, 'part-of-speech', ${sortColumn} from parts_of_speech
        union all
        select id, 'inflection-table', ${sortColumn} from inflection_tables

        order by 3 desc
        limit ${limit} offset ${offset}
      `,
      info
    );

    return {
      page: pageInfo,
      nodes: await Promise.all(nodes.map(row => {
        switch (row.type) {
          case 'language':
            return fetchLanguage(db, row.id);
          case 'definition':
            return fetchDefinition(db, row.id);
          case 'part-of-speech':
            return fetchPartOfSpeech(db, row.id);
          case 'inflection-table':
            return fetchInflectionTable(db, row.id);
        }
      })),
    };
  },
} as const;

const fetchLanguage = async (
  db: DataReader,
  id: LanguageId
): Promise<RecentItemRow> => {
  const item = await Language.byIdRequired(db, id);
  return {type: 'language', ...item};
};

const fetchDefinition = async (
  db: DataReader,
  id: DefinitionId
): Promise<RecentItemRow> => {
  const item = await Definition.byIdRequired(db, id);
  return {type: 'definition', ...item};
};

const fetchPartOfSpeech = async (
  db: DataReader,
  id: PartOfSpeechId
): Promise<RecentItemRow> => {
  const item = await PartOfSpeech.byIdRequired(db, id);
  return {type: 'part-of-speech', ...item};
};

const fetchInflectionTable = async (
  db: DataReader,
  id: InflectionTableId
): Promise<RecentItemRow> => {
  const item = await InflectionTable.byIdRequired(db, id);
  return {type: 'inflection-table', ...item};
};

export {RecentChanges};
