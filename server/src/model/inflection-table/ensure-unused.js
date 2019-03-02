const {UserInputError} = require('apollo-server');

module.exports = async (db, id) => {
  const {used} = await db.get`
    select exists (
      select 1
      from definition_inflection_tables dit
      inner join definitions d on d.id = dit.definition_id
      where dit.inflection_table_id = ${id | 0}
      limit 1
    ) as used
  `;
  if (used) {
    throw new UserInputError(
      `Operation not permitted on table ${id} because it is used by one or more lemmas`
    );
  }
};
