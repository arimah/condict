import produce, {nothing} from 'immer';

export const splitPath = (path: string): string[] =>
  path ? path.split('.') : [];

export const get = (data: unknown, path: readonly string[]): unknown => {
  let current = data;
  for (let i = 0; i < path.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    current = (current as any)[path[i]];
  }
  return current;
};

export const set = (
  data: unknown,
  path: readonly string[],
  value: unknown
): unknown =>
  // Note: we can't use update() here, as `value` may be undefined and we have
  // no way of assigning undefined to the field.
  produce(data, draft => {
    if (path.length === 0) {
      return value === undefined ? nothing : value;
    }

    let target = draft;
    for (let i = 0; i < path.length - 1; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      target = (target as any)[path[i]];
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (target as any)[path[path.length - 1]] = value;
    return;
  });

export const update = (
  data: unknown,
  path: readonly string[],
  updater: (value: unknown) => unknown | void
): unknown =>
  produce(data, draft => {
    if (path.length === 0) {
      return updater(draft);
    }

    let target = draft;
    for (let i = 0; i < path.length - 1; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      target = (target as any)[path[i]];
    }

    const lastKey = path[path.length - 1];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const result = updater((target as any)[lastKey]);
    if (result !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (target as any)[lastKey] = result;
    }
  });

export const isPathDirty = (
  path: readonly string[],
  prevData: unknown,
  nextData: unknown,
  changedPath: readonly string[]
): boolean => {
  // When an update occurs, we only want to re-render fields that were actually
  // affected by the update. If there's been a change with
  //   changedPath = ['foo', 'bar']
  // then:
  //   - [] is definitely affected
  //   - ['foo'] is definitely affected
  //   - ['foo', 'bar', 'baz'] *might* be affected, and we need to look
  //     into the value to find out.
  //   - ['quux'] is definitely *not* affected

  if (path.length < changedPath.length) {
    // path might be an ancestor of changedPath
    for (let i = 0; i < path.length; i++) {
      if (path[i] !== changedPath[i]) {
        return false;
      }
    }
    return true;
  }

  // Otherwise, path is at least as long as changedPath. path may be a child of
  // changedPath. Here we do three things simultaneously:
  //   - start resolving path inside prevData
  //   - start resolving path inside nextData
  //   - compare path against changedPath, and bail out if there's a mismatch
  let prevValue = prevData;
  let nextValue = nextData;

  let i = 0;
  for (; i < changedPath.length; i++) {
    const key = path[i];
    if (key !== changedPath[i]) {
      return false;
    }

    if (prevValue == null || nextValue == null) {
      // Path unreadable. For example, we could be dealing with the path to an
      // array item that was removed in the latest update. The field will be
      // removed once the UI updates, but we don't know that yet.
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    prevValue = (prevValue as any)[key];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    nextValue = (nextValue as any)[key];
  }

  // If we get here, path starts with changedPath. Let's keep resolving and
  // find the final value.
  for (; i < path.length; i++) {
    if (prevValue == null || nextValue == null) {
      // Path unreadable. See above.
      return false;
    }

    const key = path[i];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    prevValue = (prevValue as any)[key];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    nextValue = (nextValue as any)[key];
  }
  return prevValue !== nextValue;
};
