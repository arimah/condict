import {QueryPlanNode} from './types';

/**
 * Formats a list of SQLite query plan nodes into a textual representation.
 * @param nodes THe query plan nodes to format.
 * @return The formatted query plan graph.
 */
const formatQueryPlan = (nodes: readonly QueryPlanNode[]): string => {
  const lines: string[] = [];
  formatQueryPlanChildren(nodes, 0, 0, '', lines);
  return lines.join('\n');
};

export default formatQueryPlan;

// The query plan formatter is a somewhat inefficient quadratic implementation
// that basically assumes the node count is fairly low.
// Two assumptions are made:
//   (1) children immediately follow their parents
//   (2) all nodes have numerically increasing IDs

const formatQueryPlanChildren = (
  nodes: readonly QueryPlanNode[],
  index: number,
  parentId: number,
  prefix: string,
  result: string[]
): number => {
  let childrenLeft = countQueryPlanChildren(nodes, index, parentId);
  while (childrenLeft > 0 && index < nodes.length) {
    const node = nodes[index++];
    childrenLeft--;

    result.push(
      `${prefix}${childrenLeft === 0 ? '└─' : '├─'} ${node.description}`
    );
    index = formatQueryPlanChildren(
      nodes,
      index,
      node.id,
      `${prefix}${childrenLeft === 0 ? '   ' : '│  '}`,
      result
    );
  }
  return index;
};

const countQueryPlanChildren = (
  nodes: readonly QueryPlanNode[],
  startIndex: number,
  parentId: number
): number => {
  let count = 0;
  for (let i = startIndex; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.parentId === parentId) {
      count++;
    }
    if (node.parentId < parentId) {
      // This node belongs to an ancestor of parentId; no more children
      // of parentId could follow.
      break;
    }
  }
  return count;
};
