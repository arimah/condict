const fs = require('fs');
const path = require('path');

const models = new Map();
const mutators = new Map();

fs.readdirSync(__dirname)
  .filter(file => fs.statSync(path.join(__dirname, file)).isDirectory())
  .forEach(dir => {
    const model = require(`./${dir}/model`);
    Object.entries(model).forEach(([name, Model]) => {
      models.set(name, Model);
    });

    const mutator = require(`./${dir}/mut`);
    Object.entries(mutator).forEach(([name, Mutator]) => {
      mutators.set(name, Mutator);
    });
  });

const ModelResolverPrototype = (() => {
  const result = {};
  for (const [name, Model] of models) {
    Object.defineProperty(result, name, {
      get() {
        this.logger.debug(`Instantiating model: ${name}`);
        const value = new Model(this.db, this);
        Object.defineProperty(this, name, {value});
        return value;
      }
    });
  }
  return result;
})();

const MutatorResolverPrototype = (() => {
  const result = {};
  for (const [name, Mutator] of mutators) {
    Object.defineProperty(result, name, {
      get() {
        this.logger.debug(`Instantiating mutator: ${name}`);
        const value = new Mutator(this.db, this.model, this);
        Object.defineProperty(this, name, {value});
        return value;
      }
    });
  }
  return result;
})();

module.exports = {
  createResolver(db, logger) {
    const model = Object.assign(
      Object.create(ModelResolverPrototype),
      {db, logger}
    );
    const mut = Object.assign(
      Object.create(MutatorResolverPrototype),
      {db, logger, model}
    );
    return {model, mut};
  },
};
