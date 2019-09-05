import {GraphQLResolveInfo, SelectionSetNode} from 'graphql';

import {PageParams} from '../graphql/types';
import {Awaitable} from '../database/adaptor';

import {Connection} from './types';

type SelectedFields = {
  page: boolean;
  nodes: boolean;
};

const AllFields: SelectedFields = {
  page: true,
  nodes: true,
};

const findSelectedFields = (info?: GraphQLResolveInfo): SelectedFields => {
  if (!info) {
    return AllFields;
  }

  const {fieldNodes, fragments} = info;
  const selected: SelectedFields = {
    page: false,
    nodes: false,
  };

  const visitSelection = (selection: SelectionSetNode) => {
    for (const sel of selection.selections) {
      switch (sel.kind) {
        case 'Field':
          if (sel.name.value === 'page') {
            selected.page = true;
          }
          if (sel.name.value === 'nodes') {
            selected.nodes = true;
          }
          break;
        case 'InlineFragment':
          visitSelection(sel.selectionSet);
          break;
        case 'FragmentSpread': {
          const fragment = fragments[sel.name.value];
          visitSelection(fragment.selectionSet);
          break;
        }
      }
    }
  };

  for (const field of fieldNodes) {
    if (field.selectionSet) {
      visitSelection(field.selectionSet);
    }
  }

  return selected;
};

/**
   * Paginates a resource, creating a connection value that is compatible with
   * the GraphQL schema.
   * @param page Determines which page to fetch and how many items to fetch
   *        from that page.
   * @param getTotal A callback that returns a promise that resolves to the
   *        total number of matching items.
   * @param getNodes A callback that returns an awaitable value that resolves
   *        to the nodes in the current page. It takes the database connection,
   *        the limit (number of nodes per page), and the start offset.
   * @param info The GraphQL resolver info. This value is used to determine
   *        which callback argument to invoke. If the `page` field is not
   *        selected, `getTotal` is never called. Likewise, if the `nodes`
   *        field is not selected, `getNodes` is ignored.
   * @return A connection value that contains the nodes of the current page as
   *         well as pagination details for the connection.
 */
const paginate = async <T>(
  page: PageParams,
  getTotal: () => Awaitable<number>,
  getNodes: (limit: number, offset: number) => Awaitable<T[]>,
  info?: GraphQLResolveInfo
): Promise<Connection<T>> => {
  const selected = findSelectedFields(info);

  const offset = page.page * page.perPage;
  const [totalCount, nodes] = await Promise.all([
    selected.page ? getTotal() : 0,
    selected.nodes ? getNodes(page.perPage, offset) : [],
  ]);

  return {
    page: {
      page: page.page,
      perPage: page.perPage,
      totalCount,
    },
    nodes,
  };
};

export default paginate;
