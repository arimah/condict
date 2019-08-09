import {Map} from 'immutable';

export default (
  pattern: string,
  term: string,
  stems: Map<string, string>
) => pattern.replace(
  /(\{\{|\}\})|\{([^{}]+)\}/g,
  (_, escapedBrace, stem) => {
    if (escapedBrace) {
      return escapedBrace[0];
    }
    if (stem === '~') {
      return term;
    }
    return stems.get(stem, term);
  }
);
