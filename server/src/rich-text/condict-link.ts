// Condict internally uses the "condict://" pseudo-protocol to link to items
// within the dictionary. The following syntaxes are recognised:
//
// * condict://language/{id} links to the start page of a language.
// * condict://lemma/{id} links to a lemma.
// * condict://definition/{id} links to a definition.
// * condict://part-of-speech/{id} links to a part of speech.

const linkTargetRegex =
  /^condict:\/\/(language|lemma|definition|part-of-speech)\/([0-9]+)$/;

export type CondictLinkTarget
  = 'language'
  | 'lemma'
  | 'definition'
  | 'part-of-speech'
  ;

export interface CondictLink {
  type: CondictLinkTarget;
  id: number;
}

export const isCondictLink = (target: string) => /^condict:\/\//.test(target);

export const parseCondictLink = (target: string): CondictLink => {
  const match = linkTargetRegex.exec(target);
  if (!match) {
    throw new Error(`Invalid Condict link: ${target}`);
  }

  // The regex should never match anything that isn't
  // a valid CondictLinkTarget.
  const type = match[1] as CondictLinkTarget;
  const id = +match[2];

  return {type, id};
};
