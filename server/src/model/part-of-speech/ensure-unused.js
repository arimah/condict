const {UserInputError} = require('apollo-server');

module.exports = async (db, id) => {
  const {used} = await db.get`
    select exists (
      select 1
      from definitions
      where part_of_speech_id = ${id | 0}
      limit 1
    ) as used
  `;
  if (used) {
    throw new UserInputError(
      `Part of speech ${id} cannot be deleted because it is used by one or more lemmas`
    );
  }
};
