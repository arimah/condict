import {PageInfo} from '../graphql/types';

// NOTE: The below type is a generic version of various connection types from
// the GraphQL schema. It must be synchronised with the GraphQL schema.

/**
 * A generic connection type, matching the various GraphQL connections types
 * that exist in the schema. It must be synchronized with the GraphQL schema.
 */
export type ItemConnection<T> = {
  page: Pick<PageInfo, 'page' | 'perPage' | 'totalCount'>;
  nodes: T[];
};
