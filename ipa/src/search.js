import IpaData from './data.json';

const {chars: Chars, searchTree: SearchTable} = IpaData;

// The first level of the search tree has a much larger number of branches
// than any other level, so a hash map helps improve performance.
const SearchTableRoot = new Map(
  SearchTable.map(branch => [branch.key, branch])
);

// TODO: Normalize terms further - remove extraneous characters etc.?
const normalizeTerm = term => term.toLowerCase();

const collectLeaves = (matches, tree, matchLength, treeDepth, gapSize) => {
  const treeTermLength =
    treeDepth +
    (tree.path ? tree.path.length - 1 : 0);

  if (tree.leaves) {
    tree.leaves.forEach(([char, score]) => {
      const finalScore = Math.max(
        score * (matchLength / treeTermLength) - gapSize,
        matches.get(char) || 0
      );
      matches.set(char, finalScore);
    });
  }

  if (tree.branches) {
    tree.branches.forEach(branch => {
      collectLeaves(
        matches,
        branch,
        matchLength,
        treeTermLength + 1,
        gapSize
      );
    });
  }
};

const traversePath = (path, term, treeOffset, termOffset, gapSize) => {
  const pathLength = path.length;
  for (let i = 1; i < pathLength; i++, treeOffset++) {
    if (termOffset === term.length) {
      break;
    }

    if (term[termOffset] === path[i]) {
      // The letters are the same - it's a match!
      termOffset += 1;
    } else {
      // No match - skip a letter.
      gapSize += 1;
    }
  }
  return [treeOffset, termOffset, gapSize];
};

const searchTree = (matches, tree, term, treeOffset, termOffset, gapSize) => {
  const startTreeOffset = treeOffset;

  // If this tree has a path, the rest of the term must match at the
  // beginning of that path. If the path is "oiceless" but the rest of
  // the term is "oiced", that is not a match. On the other hand, "oice"
  // *is* a (parial) match, and then we can collect this branch's leaves.
  if (tree.path) {
    [treeOffset, termOffset, gapSize] = traversePath(
      tree.path,
      term,
      treeOffset,
      termOffset,
      gapSize
    );
  }

  // If we're at the end of the term, we've successfully matched part of
  // the search tree, so we collect all leaves as matches.
  if (termOffset === term.length) {
    collectLeaves(
      matches,
      tree,
      term.length,
      startTreeOffset,
      gapSize
    );
    return true;
  } else if (tree.branches) {
    // We still have unconsumed search term characters - search the
    // subtree for matches!
    let hasMatch = false;
    tree.branches.forEach(br => {
      const branchIsMatch = br.key === term[termOffset];
      const isMatch = searchTree(
        matches,
        br,
        term,
        treeOffset + 1,
        termOffset + branchIsMatch,
        gapSize + !branchIsMatch
      );
      hasMatch = hasMatch || isMatch;
    });
    return hasMatch;
  }

  // No match
  return false;
};

const findMatches = (matches, term) => {
  const rootTree = SearchTableRoot.get(term[0]);
  if (rootTree) {
    // We start at position 1 because we've already successfully matched
    // the first letter.
    return searchTree(matches, rootTree, term, 1, 1, 0);
  }
  // No match
  return false;
};

const search = query => {
  const terms = Array.from(new Set(
    query.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(normalizeTerm)
  ));

  const allMatches = terms
    .map(term => {
      const matches = new Map();
      return findMatches(matches, term) ? matches : null;
    })
    .reduce((previous, current) => {
      const newScores = new Map();
      if (!current) {
        return newScores;
      }

      if (!previous) {
        return current;
      }

      previous.forEach((score, char) => {
        if (current.has(char)) {
          newScores.set(char, score + current.get(char));
        }
      });
      return newScores;
    }, null);

  return Array.from(allMatches)
    .map(([char, score]) => [Chars[char], score])
    // Sort by score primarily, by input string secondarily.
    .sort((a, b) =>
      b[1] - a[1] ||
      a[0].input.localeCompare(b[0].input)
    );
};

export default search;
