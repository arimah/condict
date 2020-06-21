/**
 * Implements a generic partial mapping over a specific type. This type is used
 * by models to encapsulate partial updates to a record.
 *
 * The only reason to prefer this over a `Partial<T>` is that this type keeps
 * track of whether anything has been added to it. The database adaptor can
 * also extract the inner map if the field set is embedded inside a query.
 */
export default class FieldSet<T> {
  private map: Partial<T> = {};
  private empty = true;

  public get isEmpty(): boolean {
    return this.empty;
  }

  public get hasValues(): boolean {
    return !this.empty;
  }

  public get<K extends keyof T>(key: K): T[K] | undefined {
    return this.map[key];
  }

  public set<K extends keyof T>(key: K, value: T[K]): void {
    this.empty = false;
    this.map[key] = value;
  }

  public toPlainObject(): Partial<T> {
    return this.map;
  }
}
