import IpaData from './data.json';
import {DataFile, IpaChar} from './types';

const {chars: Chars, groups: Groups} = IpaData as DataFile;

export type ResolvedGroup = {
  readonly name: string;
  readonly base: IpaChar | null;
  readonly members: IpaChar[];
};

// Cached value for speedy reuse, as it isn't supposed to change.
let allGroups: ResolvedGroup[] | null = null;

const getGroups = (): ResolvedGroup[] => {
  if (!allGroups) {
    allGroups = Groups.map<ResolvedGroup>(g => ({
      name: g.name,
      base: g.base != null ? Chars[g.base] : null,
      // Group members are already sorted.
      members: g.members.map(m => Chars[m]),
    }));
  }
  return allGroups;
};

export default getGroups;
