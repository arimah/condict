import {DataReader} from '../../database';

import {DescriptionId, DescriptionRow} from './types';

const Description = {
  rawByIdKey: 'Description.rawById',

  async rawById(db: DataReader, id: DescriptionId): Promise<string> {
    const row = await db.batchOneToOne(
      this.rawByIdKey,
      id,
      (db, ids) =>
        db.all<DescriptionRow> `
          select *
          from descriptions
          where id in (${ids})
        `,
      row => row.id
    );
    return row ? row.description : '[]';
  },

  async parsedById(db: DataReader, id: DescriptionId): Promise<unknown> {
    const raw = await this.rawById(db, id);
    return JSON.parse(raw) as unknown;
  },
} as const;

export {Description};
