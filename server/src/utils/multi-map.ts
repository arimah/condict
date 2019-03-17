/**
 * MultiMap implements a map that permits multiple (unique) values under the
 * same key. Entries are not stored in any particular order. Values under each
 * key are not stored in a particular order.
 */
export default class MultiMap<K, V> {
  private collection: Map<K, Set<V>> = new Map();

  /** Gets the total number of keys stored in the map. */
  public get keyCount(): number {
    return this.collection.size;
  }

  /**
   * Gets the total number of entries under the specified key.
   * @param key The key to look up.
   */
  public sizeOf(key: K): number {
    const values = this.collection.get(key);
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
    for (const [_, values] of this.collection) {
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
    return this.collection.get(key) || null;
  }

  /**
   * Adds a value under the specified key.
   * @param key The key to add a value to.
   * @param value The value to add.
   */
  public add(key: K, value: V): this {
    const values = this.collection.get(key);
    if (!values) {
      this.collection.set(key, new Set().add(value));
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
    const values = this.collection.get(key);
    if (values) {
      values.delete(value);
      if (values.size === 0) {
        this.collection.delete(key);
      }
    }
    return this;
  }

  /**
   * Deletes all values from the specified key.
   * @param key The key to clear.
   */
  public deleteAll(key: K): this {
    this.collection.delete(key);
    return this;
  }

  /**
   * Deletes all values from the map.
   */
  public clear(): this {
    this.collection.clear();
    return this;
  }

  /**
   * Filters the entries of the map according to the specified predicate.
   * @param f The predicate function, which receives each key and value.
   *        If it returns true, the entry is kept; otherwise, it is discarded.
   * @return A new multi map containing entries that match the predicate.
   */
  public filter(f: (key: K, value: V) => boolean): MultiMap<K, V> {
    const result = new MultiMap<K, V>();

    for (const [key, value] of this) {
      if (f(key, value)) {
        result.add(key, value);
      }
    }

    return result;
  }

  /**
   * Projects the keys and value of the map according to the specified callback.
   * @param f The function to call for each key and value in the map. The return
   *        value is a tuple containing the new key and new value.
   * @return The new multi map.
   */
  public map<K2, V2>(f: (key: K, value: V) => [K2, V2]): MultiMap<K2, V2> {
    const result = new MultiMap<K2, V2>();

    for (const [key, value] of this) {
      const [newKey, newValue] = f(key, value);
      result.add(newKey, newValue);
    }

    return result;
  }

  /**
   * Returns an iterator that traverses the keys of the map.
   */
  public keys(): IterableIterator<K> {
    return this.collection.keys();
  }

  /**
   * Returns an iterator that traverses the entries of the map. Note that each
   * value of each key is enumerated separately.
   */
  public *entries(): IterableIterator<[K, V]> {
    for (const [key, values] of this.collection) {
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
    for (const [key, values] of this.collection) {
      for (const value of values) {
        cb(key, value);
      }
    }
  }

  public [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
}
