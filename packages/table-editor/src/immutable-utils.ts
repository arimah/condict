import {Collection} from 'immutable';

export const mapToArray = <K, T, U>(
  collection: Collection<K, T>,
  cb: (item: T, key: K) => U
): U[] => {
  const result: U[] = [];
  collection.forEach((value, key) => {
    result.push(cb(value, key));
  });
  return result;
};
