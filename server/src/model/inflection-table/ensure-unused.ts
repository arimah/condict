import {UserInputError} from 'apollo-server';

import Adaptor from '../../database/adaptor';

export default async (db: Adaptor, id: number) => {
  const {used} = await db.get`
    select exists (
      select 1
      from definition_inflection_tables dit
      inner join definitions d on d.id = dit.definition_id
      where dit.inflection_table_id = ${id}
      limit 1
    ) as used
  ` as {used: number};
  if (used === 1) {
    throw new UserInputError(
      `Operation not permitted on table ${id} because it is used by one or more lemmas`
    );
  }
};
