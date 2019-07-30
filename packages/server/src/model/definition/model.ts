import {UserInputError} from 'apollo-server';

import {validatePageParams} from '../../schema/helpers';
import {PageParams, Connection} from '../../schema/types';

import Model from '../model';
import {LemmaId} from '../lemma/types';
import {PartOfSpeechId} from '../part-of-speech/types';
import {
  InflectionTableId,
  InflectionTableLayoutId,
} from '../inflection-table/types';

import {
  DefinitionId,
  DefinitionRow,
  DefinitionDescriptionRow,
  DefinitionStemRow,
  DefinitionInflectionTableId,
  DefinitionInflectionTableRow,
  CustomInflectedFormRow,
  DerivedDefinitionRow,
} from './types';

class Definition extends Model {
  public readonly byIdKey = 'Definition.byId';
  public readonly allByLemmaKey = 'Definition.allByLemma';
  public readonly defaultPagination: Readonly<PageParams> = {
    page: 0,
    perPage: 50,
  };
  public readonly maxPerPage = 200;

  public byId(id: DefinitionId): Promise<DefinitionRow | null> {
    return this.db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<DefinitionRow>`
          select
            d.*,
            l.term_display as term
          from definitions d
          inner join lemmas l on l.id = d.lemma_id
          where d.id in (${ids})
        `,
      row => row.id
    );
  }

  public async byIdRequired(
    id: DefinitionId,
    paramName: string = 'id'
  ): Promise<DefinitionRow> {
    const definition = await this.byId(id);
    if (!definition) {
      throw new UserInputError(`Definition not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return definition;
  }

  public allByLemma(lemmaId: LemmaId): Promise<DefinitionRow[]> {
    return this.db.batchOneToMany(
      this.allByLemmaKey,
      lemmaId,
      (db, lemmaIds) =>
        db.all<DefinitionRow>`
          select
            d.*,
            l.term_display as term
          from definitions d
          inner join lemmas l on l.id = d.lemma_id
          where d.lemma_id in (${lemmaIds})
          order by d.id
        `,
      row => row.lemma_id
    );
  }

  private async anyUsesInflectionTableCond(condition: any): Promise<boolean> {
    const {used} = await this.db.getRequired<{used: number}>`
      select exists (
        select 1
        from definition_inflection_tables
        where ${condition}
      ) as used
    `;
    return used === 1;
  }

  public anyUsesInflectionTable(tableId: InflectionTableId): Promise<boolean> {
    return this.anyUsesInflectionTableCond(
      this.db.raw`inflection_table_id = ${tableId}`
    );
  }

  public anyUsesInflectionTableLayout(
    versionId: InflectionTableLayoutId
  ): Promise<boolean> {
    return this.anyUsesInflectionTableCond(
      this.db.raw`inflection_table_version_id = ${versionId}`
    );
  }

  public allByInflectionTableCond(
    condition: any,
    page?: PageParams | null
  ): Promise<Connection<DefinitionRow>> {
    return this.db.paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      async db => {
        const {total} = await db.getRequired<{total: number}>`
          select count(distinct dit.definition_id) as total
          from definition_inflection_tables dit
          where ${condition}
        `;
        return total;
      },
      (db, limit, offset) => db.all<DefinitionRow>`
        select
          d.*,
          l.term_display as term
        from definition_inflection_tables dit
        inner join definitions d on d.id = dit.definition_id
        inner join lemmas l on l.id = d.lemma_id
        where ${condition}
        group by d.id
        order by l.term_display, d.id
        limit ${limit} offset ${offset}
      `
    );
  }

  public allByInflectionTable(
    tableId: InflectionTableId,
    page?: PageParams | null
  ): Promise<Connection<DefinitionRow>> {
    return this.allByInflectionTableCond(
      this.db.raw`dit.inflection_table_id = ${tableId}`,
      page
    );
  }

  public allByInflectionTableLayout(
    versionId: InflectionTableLayoutId,
    page?: PageParams | null
  ): Promise<Connection<DefinitionRow>> {
    return this.allByInflectionTableCond(
      this.db.raw`dit.inflection_table_version_id = ${versionId}`,
      page
    );
  }

  public async anyUsesPartOfSpeech(
    partOfSpeechId: PartOfSpeechId
  ): Promise<boolean> {
    const {used} = await this.db.getRequired<{used: number}>`
      select exists (
        select 1
        from definitions
        where part_of_speech_id = ${partOfSpeechId}
      ) as used
    `;
    return used === 1;
  }

  public allByPartOfSpeech(
    partOfSpeechId: PartOfSpeechId,
    page?: PageParams | null
  ): Promise<Connection<DefinitionRow>> {
    const condition = this.db.raw`
      d.part_of_speech_id = ${partOfSpeechId}
    `;
    return this.db.paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      async db => {
        const {total} = await db.getRequired<{total: number}>`
          select count(*) as total
          from definitions d
          where ${condition}
        `;
        return total;
      },
      (db, limit, offset) => db.all<DefinitionRow>`
        select
          d.*,
          l.term_display as term
        from definitions d
        inner join lemmas l on l.id = d.lemma_id
        where ${condition}
        order by l.term_display, d.id
        limit ${limit} offset ${offset}
      `
    );
  }
}

class DefinitionDescription extends Model {
  public readonly rawByDefinitionKey = 'DefinitionDescription.rawByDefinition';

  public rawByDefinition(definitionId: DefinitionId): Promise<string> {
    return this.db
      .batchOneToOne(
        this.rawByDefinitionKey,
        definitionId,
        (db, definitionIds) =>
          db.all<DefinitionDescriptionRow>`
            select *
            from definition_descriptions
            where definition_id in (${definitionIds})
          `,
        row => row.definition_id
      )
      // The string 'null' is a valid JSON value. In theory we should never
      // find any null values here, but I guess being defensive doesn't hurt.
      .then(row => row ? row.description : 'null');
  }
}

class DefinitionStem extends Model {
  public readonly allByDefinitionKey = 'DefinitionStem.allByDefinition';

  public allByDefinition(
    definitionId: DefinitionId
  ): Promise<DefinitionStemRow[]> {
    return this.db.batchOneToMany(
      this.allByDefinitionKey,
      definitionId,
      (db, definitionIds) =>
        db.all<DefinitionStemRow>`
          select *
          from definition_stems
          where definition_id in (${definitionIds})
          order by definition_id, name
        `,
      row => row.definition_id
    );
  }
}

class DefinitionInflectionTable extends Model {
  public readonly byIdKey = 'DefinitionInflectionTable.byId';
  public readonly allByDefinitionKey = 'DefinitionInflectionTable.allByDefinition';

  public byId(
    id: DefinitionInflectionTableId
  ): Promise<DefinitionInflectionTableRow | null> {
    return this.db.batchOneToOne(
      this.byIdKey,
      id,
      (db, ids) =>
        db.all<DefinitionInflectionTableRow>`
          select *
          from definition_inflection_tables
          where id in (${ids})
        `,
      row => row.id
    );
  }

  public async byIdRequired(
    id: DefinitionInflectionTableId,
    paramName: string = 'id'
  ): Promise<DefinitionInflectionTableRow> {
    const table = await this.byId(id);
    if (!table) {
      throw new UserInputError(`Definition inflection table not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return table;
  }

  public allByDefinition(
    definitionId: DefinitionId
  ): Promise<DefinitionInflectionTableRow[]> {
    return this.db.batchOneToMany(
      this.allByDefinitionKey,
      definitionId,
      (db, definitionIds) =>
        db.all<DefinitionInflectionTableRow>`
          select *
          from definition_inflection_tables
          where definition_id in (${definitionIds})
          order by definition_id, sort_order
        `,
      row => row.definition_id
    );
  }
}

class CustomInflectedForm extends Model {
  public readonly allByTableKey = 'CustomInflectedForm.allByTable';

  public allByTable(
    tableId: DefinitionInflectionTableId
  ): Promise<CustomInflectedFormRow[]> {
    return this.db.batchOneToMany(
      this.allByTableKey,
      tableId,
      (db, tableIds) =>
        db.all<CustomInflectedFormRow>`
          select *
          from definition_forms
          where definition_inflection_table_id in (${tableIds})
          order by definition_inflection_table_id, inflected_form_id
        `,
      row => row.definition_inflection_table_id
    );
  }
}

class DerivedDefinition extends Model {
  public readonly allByLemmaKey = 'DerivedDefinition.allByLemma';
  public readonly defaultPagination: Readonly<PageParams> = {
    page: 0,
    perPage: 50,
  };
  public readonly maxPerPage = 200;

  public allByLemma(lemmaId: LemmaId): Promise<DerivedDefinitionRow[]> {
    return this.db.batchOneToMany(
      this.allByLemmaKey,
      lemmaId,
      (db, lemmaIds) =>
        db.all<DerivedDefinitionRow>`
          select
            dd.*,
            l.term_display as term,
            l.language_id
          from derived_definitions dd
          inner join lemmas l on l.id = dd.lemma_id
          where dd.lemma_id in (${lemmaIds})
          order by dd.original_definition_id, dd.inflected_form_id
        `,
      row => row.lemma_id
    );
  }

  public async allByDerivedFrom(
    definitionId: DefinitionId,
    page?: PageParams | null
  ): Promise<Connection<DerivedDefinitionRow>> {
    const condition = this.db.raw`
      dd.original_definition_id = ${definitionId}
    `;
    return this.db.paginate(
      validatePageParams(page || this.defaultPagination, this.maxPerPage),
      async db => {
        const {total} = await db.getRequired<{total: number}>`
          select count(*) as total
          from derived_definitions dd
          where ${condition}
        `;
        return total;
      },
      (db, limit, offset) => db.all<DerivedDefinitionRow>`
        select
          dd.*,
          l.term_display as term,
          l.language_id
        from derived_definitions dd
        inner join lemmas l on l.id = dd.lemma_id
        where ${condition}
        order by l.term_display, dd.inflected_form_id
        limit ${limit} offset ${offset}
      `
    );
  }
}

export default {
  Definition,
  DefinitionDescription,
  DefinitionStem,
  DefinitionInflectionTable,
  CustomInflectedForm,
  DerivedDefinition,
};
