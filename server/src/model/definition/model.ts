import {UserInputError} from 'apollo-server';

import {validatePageParams, createConnection} from '../../schema/helpers';
import {PageParams} from '../../schema/types';

import Model from '../model';

export interface DefinitionRow {
  id: number;
  lemma_id: number;
  language_id: number;
  part_of_speech_id: number;
  term: string;
}

export interface DefinitionDescriptionRow {
  definition_id: number;
  /** JSON-serialized data */
  description: string;
}

export interface DefinitionStemRow {
  definition_id: number;
  name: string;
  value: string;
}

export interface DefinitionInflectionTableRow {
  id: number;
  definition_id: number;
  inflection_table_id: number;
  sort_order: number;
  caption: string;
}

export interface CustomInflectedFormRow {
  definition_inflection_table_id: number;
  inflected_form_id: number;
  inflected_form: string;
}

export interface DerivedDefinitionRow {
  lemma_id: number;
  original_definition_id: number;
  inflected_form_id: number;
  term: string;
  language_id: number;
}

class Definition extends Model {
  public readonly byIdKey = 'Definition.byId';
  public readonly allByLemmaKey = 'Definition.allByLemma';

  public byId(id: number) {
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

  public async byIdRequired(id: number, paramName: string = 'id') {
    const definition = await this.byId(id);
    if (!definition) {
      throw new UserInputError(`Definition not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return definition;
  }

  public allByLemma(lemmaId: number) {
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
}

class DefinitionDescription extends Model {
  public readonly rawByDefinitionKey = 'DefinitionDescription.rawByDefinition';

  public rawByDefinition(definitionId: number) {
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

  public allByDefinition(definitionId: number) {
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

  public byId(id: number) {
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

  public async byIdRequired(id: number, paramName: string = 'id') {
    const table = await this.byId(id);
    if (!table) {
      throw new UserInputError(`Definition inflection table not found: ${id}`, {
        invalidArgs: [paramName],
      });
    }
    return table;
  }

  public allByDefinition(definitionId: number) {
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

  public allByTable(tableId: number) {
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

  public allByLemma(lemmaId: number) {
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

  public async allByDerivedFrom(definitionId: number, page?: PageParams | null) {
    page = validatePageParams(page || this.defaultPagination, this.maxPerPage);

    // The pagination parameters make batching difficult and probably unnecessary.
    const offset = page.page * page.perPage;
    const {db} = this;
    const condition = db.raw`
      dd.original_definition_id = ${definitionId}
    `;
    const {total: totalCount} = await db.get`
      select count(*) as total
      from derived_definitions dd
      where ${condition}
    ` as {total: number};
    const nodes = await db.all<DerivedDefinitionRow>`
      select
        dd.*,
        l.term_display as term,
        l.language_id
      from derived_definitions dd
      inner join lemmas l on l.id = dd.lemma_id
      where ${condition}
      order by l.term_display, dd.inflected_form_id
      limit ${page.perPage} offset ${offset}
    `;
    return createConnection(page, totalCount, nodes);
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
