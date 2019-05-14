class SearchTree {
  constructor(path) {
    this.path = path;
    this.leaves = [];
    this.branches = new Map();
  }

  addTerm(char, score, term, currentDepth = 0) {
    if (currentDepth === term.length) {
      this.leaves.push([char, score]);
    } else {
      const path = term[currentDepth];
      let branch = this.branches.get(path);
      if (!branch) {
        branch = new SearchTree(path);
        this.branches.set(path, branch);
      }
      branch.addTerm(char, score, term, currentDepth + 1);
    }
  }
}

const compactTree = tree => {
  const result = new SearchTree(tree.path);
  result.leaves = tree.leaves;

  for (const [key, branch] of tree.branches) {
    result.branches.set(key, compactTree(branch));
  }

  if (result.branches.size === 1 && result.leaves.length === 0) {
    const [firstBranch] = result.branches.values();
    firstBranch.path = `${result.path}${firstBranch.path}`;
    return firstBranch;
  }
  return result;
};

const treeToPlainObject = (tree, chars) => {
  const result = {};

  if (tree.path.length === 1) {
    result.key = tree.path;
  } else {
    result.path = tree.path;
  }

  if (tree.leaves.length > 0) {
    result.leaves = tree.leaves;
  }

  if (tree.branches.size > 0) {
    result.branches = Array.from(tree.branches.values())
      .map(branch => treeToPlainObject(branch, chars));
    result.branches.sort((a, b) =>
      a.key < b.key ? -1 :
      a.key > b.key ? 1 :
      0
    );
  }

  return result;
};

module.exports = chars => {
  const tree = new SearchTree('');

  let charIndex = 0;
  for (const char of chars) {
    for (const [term, score] of char.terms) {
      tree.addTerm(charIndex, score, term);
    }
    charIndex += 1;
  }

  const compact = compactTree(tree);

  return treeToPlainObject(compact, chars).branches;
};
