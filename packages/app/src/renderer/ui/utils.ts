/**
 * Inserts a value between the elements of an array. The separator value is
 * not inserted at the beginning or end, nor if there is only one item in
 * the array.
 *
 * For example, `intersperse('x', ['a', 'b', 'c'])` returns an array with
 * `['a', 'x', 'b', 'x', 'c']`.
 *
 * This function can be used to add a separator between React elements. In
 * that case, if the separator is a React element, remember that it must have
 * a unique key. There is no way to arrange that with this method.
 * @param separator The value to insert between elements.
 * @param array The array to intersperse values into.
 * @return A new array with interspersed values.
 */
export function intersperse<T, Sep = T>(
  separator: Sep,
  array: readonly T[]
): (T | Sep)[] {
  // Shortcut: we know no items will be inserted if there are fewer than
  // two items in the array.
  // NB: We must return a new array.
  if (array.length === 0) {
    return [];
  }
  if (array.length === 1) {
    return [array[0]];
  }

  return array.reduce((result, value, index) => {
    if (index > 0) {
      result.push(separator);
    }
    result.push(value);
    return result;
  }, new Array<T | Sep>(2 * array.length - 1));
}
