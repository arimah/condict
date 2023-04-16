import {LemmaFilter} from '../../graphql';
import {DataReader, RawSql} from '../../database';

/**
 * Determines whether the lemma list actually requires filtering, given the
 * current filter input.
 * @param filter The lemma filter to test.
 * @return True if the lemma list requires filtering; false if the language's
 *         lemmas can be read without filtering.
 */
export const isFilteringNeeded = (filter: LemmaFilter): boolean => {
  const kind = filter.kind ?? 'ALL_LEMMAS';
  if (
    kind !== 'ALL_LEMMAS' ||
    filter.inPartsOfSpeech ||
    filter.inflectsLike
  ) {
    return true;
  }
  const tagMatching = filter.tagMatching ?? 'MATCH_ANY';
  if (
    filter.withTags && (
      // MATCH_ANY: empty list excludes everything, so filtering is needed.
      tagMatching === 'MATCH_ANY' ||
      // MATCH_ALL: empty list is no-op, so only filter if tag list is non-empty
      filter.withTags.length > 0
    )
  ) {
    return true;
  }
  // No parts of speech or inflection tables, and no filterable tags.
  return false;
};

/**
 * Determines whether the specified filter is trivially impossible; that is,
 * cannot possibly match any lemmas. In that case, no database access is
 * required.
 * @param filter The lemma filter to test.
 * @return True if the filter is trivially impossible; that is, cannot possibly
 *         match any lemmas. Otherwise, false. Note that a return value of false
 *         does not imply that the filter will match anything, merely that it
 *         *might* (as opposed to *definitely won't*).
 */
export const isFilterImpossible = (filter: LemmaFilter): boolean => {
  if (
    // Empty part of speech filter can't match anything.
    filter.inPartsOfSpeech && filter.inPartsOfSpeech.length === 0 ||
    // Empty inflection table filter can't match anything.
    filter.inflectsLike && filter.inflectsLike.length === 0
  ) {
    return true;
  }
  if (filter.withTags) {
    // Derived definitions cannot currently be searched by tag, so the tag
    // filter will match nothing.
    if (filter.kind === 'DERIVED_LEMMAS_ONLY') {
      return true;
    }

    const tagMatching = filter.tagMatching ?? 'MATCH_ANY';
    // Empty tag list can't match anything in MATCH_ANY mode.
    if (tagMatching === 'MATCH_ANY' && filter.withTags.length === 0) {
      return true;
    }
  }
  return false;
};

const EmptySql = new RawSql('', []);

export const buildOwnDefinitionsSource = (
  db: DataReader,
  alias: RawSql,
  joinType: 'left' | 'inner',
  filter: LemmaFilter
): RawSql => {
  if (filter.kind === 'DERIVED_LEMMAS_ONLY') {
    return EmptySql;
  }

  const tagMatching = filter.tagMatching ?? 'MATCH_ANY';
  const needsMatchingTagCount =
    filter.withTags != null &&
    tagMatching === 'MATCH_ALL';
  return db.raw`
    ${db.raw(joinType)} join (
      select
        ${needsMatchingTagCount
          ? db.raw`count(distinct dt.tag_id) as tag_count,`
          : EmptySql}
        d.lemma_id
      from definitions d
      ${filter.inflectsLike
        ? db.raw`
          inner join definition_inflection_tables dit on
            dit.definition_id = d.id and
            dit.inflection_table_id in (${filter.inflectsLike})
        `
        : EmptySql}
      ${filter.withTags
        ? db.raw`
          inner join definition_tags dt on
            dt.definition_id = d.id and
            dt.tag_id in (${filter.withTags})
        `
        : EmptySql}
      ${filter.inPartsOfSpeech
        ? db.raw`where d.part_of_speech_id in (${filter.inPartsOfSpeech})`
        : EmptySql}
      ${filter.inflectsLike || filter.withTags
        ? db.raw`group by d.lemma_id`
        : EmptySql}
      ${needsMatchingTagCount
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ? db.raw`having tag_count = ${filter.withTags!.length}`
        : EmptySql}
    ) ${alias} on ${alias}.lemma_id = l.id
  `;
};

export const buildDerivedDefinitionsSource = (
  db: DataReader,
  alias: RawSql,
  joinType: 'left' | 'inner',
  filter: LemmaFilter
): RawSql => {
  if (filter.kind === 'DEFINED_LEMMAS_ONLY') {
    return EmptySql;
  }

  return db.raw`
    ${db.raw(joinType)} join (
      select dd.lemma_id
      from derived_definitions dd
      ${filter.inPartsOfSpeech
        ? db.raw`
          inner join definitions d on
            d.id = dd.original_definition_id and
            d.part_of_speech_id in (${filter.inPartsOfSpeech})
        `
        : EmptySql}
      ${filter.inflectsLike
        ? db.raw`
          inner join inflected_forms ifrm on ifrm.id = dd.inflected_form_id
          inner join inflection_table_versions itv on
            itv.id = ifrm.inflection_table_version_id and
            itv.inflection_table_id in (${filter.inflectsLike})
        `
        : EmptySql}
      ${filter.inPartsOfSpeech || filter.inflectsLike
        ? db.raw`group by dd.lemma_id`
        : EmptySql}
    ) ${alias} on ${alias}.lemma_id = l.id
  `;
};
