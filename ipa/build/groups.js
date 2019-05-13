module.exports = chars => {
  const groups = new Map();

  let charIndex = 0;
  for (const char of chars) {
    let group = groups.get(char.group);
    if (!group) {
      group = {members: []};
      groups.set(char.group, group);
    }
    if (char.group === char.input) {
      group.base = charIndex;
    } else {
      group.members.push(charIndex);
    }
    charIndex += 1;
  }

  for (const group of groups.values()) {
    group.members.sort((a, b) => {
      const aInput = chars[a].input;
      const bInput = chars[b].input;
      return aInput.localeCompare(bInput, 'en-US');
    });
  }

  return Array.from(groups)
    .sort((a, b) => {
      // Groups with a base are sorted before others
      const aHasBase = a[1].base != null;
      const bHasBase = b[1].base != null;
      if (aHasBase !== bHasBase) {
        return bHasBase - aHasBase;
      }
      // Secondarily we sort by group name.
      // Note: This actually *does* work correctly with IPA's ɡ.
      return a[0].localeCompare(b[0], 'en-US');
    })
    .map(entry => entry[1]);
};
