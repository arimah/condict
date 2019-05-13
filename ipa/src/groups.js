import IpaData from './data.json';

const {chars: Chars, groups: Groups} = IpaData;

// Cached value for speedy reuse, as it isn't supposed to change.
let allGroups = null;

const getGroups = () => {
  if (!allGroups) {
    allGroups = Groups.map(g => ({
      base: g.base != null ? Chars[g.base] : null,
      // Group members are already sorted.
      members: g.members.map(m => Chars[m]),
    }));
  }
  return allGroups;
};

export default getGroups;
