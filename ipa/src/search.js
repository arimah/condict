import IpaData from './data.json';

const {chars: Chars, searchTree: SearchTable} = IpaData;

// The first level of the search tree has a much larger number of branches
// than any other level, so a hash map helps improve performance.
const SearchTableRoot = new Map(
  SearchTable.map(branch => [branch.path, branch])
);

// TODO: Normalize terms further - remove extraneous characters etc.?
const normalizeTerm = term => term.toLowerCase();

const collectLeaves = (addMatch, tree, query, treeDepth, gapSize) => {
  const treeTermLength = treeDepth + tree.path.length - 1;

  if (tree.leaves) {
    for (let i = 0; i < tree.leaves.length; i++) {
      const [char, score] = tree.leaves[i];
      const finalScore = score * (query.length / (treeTermLength + 2 * gapSize));
      addMatch(char, tree.term, query, finalScore);
    }
  }

  if (tree.branches) {
    for (let i = 0; i < tree.branches.length; i++) {
      const branch = tree.branches[i];
      collectLeaves(
        addMatch,
        branch,
        query,
        treeTermLength + 1,
        gapSize
      );
    }
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

const searchTree = (addMatch, tree, term, treeOffset, termOffset, gapSize) => {
  const startTreeOffset = treeOffset;

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
      addMatch,
      tree,
      term,
      startTreeOffset,
      gapSize
    );
    return true;
  } else if (tree.branches) {
    // We still have unconsumed search term characters - search the
    // subtree for matches!
    let hasMatch = false;
    tree.branches.forEach(br => {
      const branchIsMatch = br.path[0] === term[termOffset];
      const isMatch = searchTree(
        addMatch,
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

const findMatches = (addMatch, term) => {
  const rootTree = SearchTableRoot.get(term[0]);
  if (rootTree) {
    // We start at position 1 because we've already successfully matched
    // the first letter.
    return searchTree(addMatch, rootTree, term, 1, 1, 0);
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

  const allMatches = new Map();
  const addFirstTermMatch = (char, term, query, score) => {
    const termMatch = {term, query, score};

    const match = allMatches.get(char);
    if (match) {
      match.totalScore += score;
      match.terms.push(termMatch);
      match.matchingQueryWords.add(query);
    } else {
      allMatches.set(char, {
        totalScore: score,
        terms: [termMatch],
        matchingQueryWords: new Set().add(query),
      });
    }
  };
  const addSubsequentTermMatch = (char, term, query, score) => {
    const match = allMatches.get(char);
    if (!match) {
      return;
    }

    const existingTerm = match.terms.find(t => t.term === term);
    if (existingTerm) {
      if (existingTerm.score < score) {
        match.totalScore -= existingTerm.score;
        match.totalScore += score;

        existingTerm.score = score;
        existingTerm.query = query;
      }
    } else {
      match.totalScore += score;
      match.terms.push({term, query, score});
      match.matchingQueryWords.add(query);
    }
  };

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const addMatch = i === 0 ? addFirstTermMatch : addSubsequentTermMatch;
    if (!findMatches(addMatch, term)) {
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
      match.matchingQueryWords.size === terms.length &&
      match.terms.length >= terms.length
    )
    // Resolve each character index and remove the the 'matchingQueryWords' property.
    .map(([char, {totalScore, terms}]) => [Chars[char], {totalScore, terms}])
    // Sort by score primarily, by input string secondarily.
    .sort((a, b) =>
      b[1].totalScore - a[1].totalScore ||
      a[0].input.localeCompare(b[0].input)
    );
};

export default search;
