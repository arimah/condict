class FieldSet {
  constructor() {
    this.map = new Map();
  }

  get size() {
    return this.map.size;
  }

  get(key) {
    return this.map.get(key);
  }

  set(key, value) {
    this.map.set(key, value);
  }

  toPlainObject() {
    const obj = {};
    this.map.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
}

module.exports = FieldSet;
