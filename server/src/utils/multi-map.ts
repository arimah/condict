/**
 * MultiMap implements a map that permits multiple (unique) values under the
 * same key. Entries are not stored in any particular order. Values under each
 * key are not stored in a particular order.
 */
export default class MultiMap<K, V> {
  private map: Map<K, Set<V>> = new Map();

  /** Gets the total number of keys stored in the map. */
  public get keyCount(): number {
    return this.map.size;
  }

  /**
   * Gets the total number of entries under the specified key.
   * @param key The key to look up.
   */
  public sizeOf(key: K): number {
    const values = this.map.get(key);
    if (values) {
      return values.size;
    }
    return 0;
  }

  /**
   * Gets the total number of values in the map. Note: this operation has O(n)
   * time complexity, where n = the number of keys.
   */
  public getTotalSize(): number {
    let total = 0;
    for (const [_, values] of this.map) {
      total += values.size;
    }
    return total;
  }

  /**
   * Gets the values under the specified key.
   * @param key The key to look up.
   * @return The values under the specified key, or null if the key is empty.
   */
  public get(key: K): Set<V> | null {
    return this.map.get(key) || null;
  }

  /**
   * Adds a value under the specified key.
   * @param key The key to add a value to.
   * @param value The value to add.
   */
  public add(key: K, value: V): this {
    const values = this.map.get(key);
    if (!values) {
      this.map.set(key, new Set().add(value));
    } else {
      values.add(value);
    }
    return this;
  }

  /**
   * Deletes the specified value under the specified key.
   * @param key The key to delete a value from.
   * @param value The value to delete.
   */
  public delete(key: K, value: V): this {
    const values = this.map.get(key);
    if (values) {
      values.delete(value);
      if (values.size === 0) {
        this.map.delete(key);
      }
    }
    return this;
  }

  /**
   * Deletes all values from the specified key.
   * @param key The key to clear.
   */
  public deleteAll(key: K): this {
    this.map.delete(key);
    return this;
  }

  /**
   * Deletes all values from the map.
   */
  public clear(): this {
    this.map.clear();
    return this;
  }

  /**
   * Returns an iterator that traverses the keys of the map.
   */
  public keys(): IterableIterator<K> {
    return this.map.keys();
  }

  /**
   * Returns an iterator that traverses the entries of the map. Note that each
   * value of each key is enumerated separately.
   */
  public *entries(): IterableIterator<[K, V]> {
    for (const [key, values] of this.map) {
      for (const value of values) {
        yield [key, value];
      }
    }
  }

  /**
   * Visits each entry of the map. Note that each value of each key is enumerated
   * separately.
   * @param cb A callback that receives each value under each key.
   */
  public forEach(cb: (key: K, value: V) => void) {
    for (const [key, values] of this.map) {
      for (const value of values) {
        cb(key, value);
      }
    }
  }

  public [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
}
