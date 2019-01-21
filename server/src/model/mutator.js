class Mutator {
  constructor(db, model, mut) {
    this.db = db;
    this.model = model;
    this.mut = mut;
  }
}

module.exports = Mutator;
