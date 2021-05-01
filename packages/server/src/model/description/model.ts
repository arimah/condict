import {DataReader} from '../../database';

import {DescriptionId, DescriptionRow} from './types';

const Description = {
  rawByIdKey: 'Description.rawById',

  rawById(db: DataReader, id: DescriptionId): Promise<string> {
    return db
      .batchOneToOne(
        this.rawByIdKey,
        id,
        (db, ids) =>
          db.all<DescriptionRow>`
            select *
            from descriptions
            where id in (${ids})
          `,
        row => row.id
      )
      .then(row => row ? row.description : '[]');
  },
} as const;

export {Description};
