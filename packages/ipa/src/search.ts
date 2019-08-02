import IpaData from './data.json';
import {DataFile, IpaChar, IpaSearchNode} from './types';

export type Match = [IpaChar, MatchInfo];

export interface MatchInfo {
  totalScore: number;
  terms: TermMatch[];
}

export interface TermMatch {
  term: string;
  query: string;
  score: number;
}

type MatchConsumer = (char: number, term: string, query: string, score: number) => void;

interface WorkingMatch {
  terms: TermMatch[];
  totalScore: number;
  queryWordScores: Map<string, number>;
}

const {chars: Chars, searchTree: SearchTable} = IpaData as DataFile;

// The first level of the search tree has a much larger number of branches
// than any other level, so a hash map helps improve performance.
const SearchTableRoot = new Map(
  SearchTable.map(branch => [branch.path, branch])
);

// TODO: Normalize query words further - remove extraneous characters etc.?
const normalizeQueryWord = (q: string) => q.toLowerCase();

const collectLeaves = (
  addMatch: MatchConsumer,
  tree: IpaSearchNode,
  query: string,
  gapSize: number
) => {
  if (tree.leaves && tree.term) {
    const treeTermScore = query.length / (tree.term.length + 2 * gapSize);
    for (let i = 0; i < tree.leaves.length; i++) {
      const [char, score] = tree.leaves[i];
      const finalScore = score * treeTermScore;
      addMatch(char, tree.term, query, finalScore);
    }
  }

  if (tree.branches) {
    for (let i = 0; i < tree.branches.length; i++) {
      const branch = tree.branches[i];
      collectLeaves(addMatch, branch, query, gapSize);
    }
  }
};

const traversePath = (
  path: string,
  query: string,
  queryOffset: number,
  gapSize: number
): [number, number] => {
  const pathLength = path.length;
  for (let i = 1; i < pathLength; i++) {
    if (queryOffset === query.length) {
      break;
    }

    if (query[queryOffset] === path[i]) {
      // The letters are the same - it's a match!
      queryOffset += 1;
    } else {
      // No match - skip a letter.
      gapSize += 1;
    }
  }
  return [queryOffset, gapSize];
};

const searchTree = (
  addMatch: MatchConsumer,
  tree: IpaSearchNode,
  query: string,
  queryOffset: number,
  gapSize: number
): boolean => {
  // If this tree has a multi-character path, we must traverse it as we
  // would a set of single-branch trees. Example:
  //
  //   query:     vicelss
  //   tree:      v
  //               oice
  //                   less
  //   matches:
  //              v icel ss
  if (tree.path.length > 1) {
    [queryOffset, gapSize] = traversePath(
      tree.path,
      query,
      queryOffset,
      gapSize
    );
  }

  // If we're at the end of the query, we've successfully matched part of
  // the search tree, so we collect all leaves as matches.
  if (queryOffset === query.length) {
    collectLeaves(addMatch, tree, query, gapSize);
    return true;
  } else if (tree.branches) {
    // We still have unconsumed search query characters - search the
    // subtree for matches!
    let hasMatch = false;
    tree.branches.forEach(br => {
      const branchIsMatch = br.path[0] === query[queryOffset];
      const isMatch = searchTree(
        addMatch,
        br,
        query,
        queryOffset + +branchIsMatch,
        gapSize + +!branchIsMatch
      );
      hasMatch = hasMatch || isMatch;
    });
    return hasMatch;
  }

  // No match
  return false;
};

const findMatches = (addMatch: MatchConsumer, query: string) => {
  const rootTree = SearchTableRoot.get(query[0]);
  if (rootTree) {
    // We start at position 1 because we've already successfully matched
    // the first letter.
    return searchTree(addMatch, rootTree, query, 1, 0);
  }
  // No match
  return false;
};

const updateQueryWordScore = (match: WorkingMatch, query: string, score: number) => {
  const prevScore = match.queryWordScores.get(query) || 0;
  const nextScore = Math.max(prevScore, score);
  match.queryWordScores.set(query, nextScore);
  match.totalScore += nextScore - prevScore;
};

const search = (query: string): Match[] => {
  const queryWords = Array.from(new Set(
    query.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(normalizeQueryWord)
  ));

  const allMatches = new Map<number, WorkingMatch>();
  const addFirstQueryWordMatch: MatchConsumer = (
    char: number,
    term: string,
    query: string,
    score: number
  ) => {
    const termMatch = {term, query, score};

    const match = allMatches.get(char);
    if (match) {
      match.terms.push(termMatch);
      updateQueryWordScore(match, query, score);
    } else {
      allMatches.set(char, {
        totalScore: score,
        terms: [termMatch],
        queryWordScores: new Map().set(query, score),
      });
    }
  };
  const addSubsequentQueryWordMatch: MatchConsumer = (
    char: number,
    term: string,
    query: string,
    score: number
  ) => {
    const match = allMatches.get(char);
    if (!match) {
      return;
    }

    updateQueryWordScore(match, query, score);

    const existingTerm = match.terms.find(t => t.term === term);
    if (existingTerm) {
      if (existingTerm.score < score) {
        existingTerm.score = score;
        existingTerm.query = query;
      }
    } else {
      match.terms.push({term, query, score});
    }
  };

  for (let i = 0; i < queryWords.length; i++) {
    const queryWord = queryWords[i];
    const addMatch = i === 0
      ? addFirstQueryWordMatch
      : addSubsequentQueryWordMatch;
    if (!findMatches(addMatch, queryWord)) {
      // If a word in the search string didn't match anything, we can return
      // an empty result right away.
      return [];
    }
  }

  return Array.from(allMatches)
    // Each word in the query must match *something* in each character,
    // and the number of matching terms must be at least as big as the
    // number of query words.
    .filter(([_, match]) =>
      match.queryWordScores.size === queryWords.length &&
      match.terms.length >= queryWords.length
    )
    // Resolve each character index and remove the the 'queryWordScores' property.
    .map<Match>(([char, {totalScore, terms}]) => [Chars[char], {totalScore, terms}])
    // Sort by score primarily, by input string secondarily.
    .sort((a: Match, b: Match) =>
      b[1].totalScore - a[1].totalScore ||
      a[0].input.localeCompare(b[0].input)
    );
};

export default search;
