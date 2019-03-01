// Condict internally uses the "condict://" pseudo-protocol to link to items
// within the dictionary. The following syntaxes are recognised:
//
// * condict://language/{id} links to the start page of a language.
// * condict://lemma/{id} links to a lemma.
// * condict://definition/{id} links to a definition.
// * condict://part-of-speech/{id} links to a part of speech.

const linkTargetRegex =
  /^condict:\/\/(language|lemma|definition|part-of-speech)\/([0-9]+)$/;

const isCondictLink = target => /^condict:\/\//.test(target);

const parseCondictLink = target => {
  const match = linkTargetRegex.exec(target);
  if (!match) {
    throw new Error(`Invalid Condict link: ${target}`);
  }

  const type = match[1];
  const id = match[2] | 0;

  return {type, id};
};

module.exports = {
  isCondictLink,
  parseCondictLink,
};
