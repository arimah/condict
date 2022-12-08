const addChar = (allReplacements, charData, input, char) => {
  const firstChar = input[0];
  let replacements = allReplacements.get(firstChar);
  if (!replacements) {
    replacements = [];
    allReplacements.set(firstChar, replacements);
  }
  replacements.push([input, char]);

  if (input !== char.ipa) {
    charData.set(char.ipa, char);
  }
  if (char.alt) {
    Object.values(char.alt).forEach(alt => {
      charData.set(alt.ipa, alt);
    });
  }
};

const sortReplacements = replacements => {
  if (replacements.length > 1) {
    // Sort replacements by input length, descending order. This ensures that
    // we test longer replacements first.
    replacements.sort((a, b) => b[0].length - a[0].length);
  }
};

export default charMap => {
  const allReplacements = new Map();
  const charData = new Map();

  charMap.forEach((char, input) => {
    addChar(allReplacements, charData, input, char);
  });

  allReplacements.forEach(sortReplacements);

  return {replacements: allReplacements, charData};
};
