import IpaData from './data.json';
import {DataFile, IpaGroup} from './types';

const {chars: Chars, groups: Groups} = IpaData as DataFile;

// Cached value for speedy reuse, as it isn't supposed to change.
let allGroups: readonly IpaGroup[] | null = null;

const getGroups = (): readonly IpaGroup[] => {
  if (!allGroups) {
    allGroups = Groups.map<IpaGroup>(g => ({
      name: g.name,
      base: g.base != null ? Chars[g.base] : null,
      // Group members are already sorted.
      members: g.members.map(m => Chars[m]),
    }));
  }
  return allGroups;
};

export default getGroups;
