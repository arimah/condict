import {UserInputError} from 'apollo-server';

import Adaptor from '../../database/adaptor';

export default async (db: Adaptor, id: number) => {
  const {used} = await db.get`
    select exists (
      select 1
      from definitions
      where part_of_speech_id = ${id}
      limit 1
    ) as used
  ` as {used: number};
  if (used === 1) {
    throw new UserInputError(
      `Part of speech ${id} cannot be deleted because it is used by one or more lemmas`
    );
  }
};
