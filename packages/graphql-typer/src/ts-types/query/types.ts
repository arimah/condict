import {
  FragmentDefinitionNode,
  SelectionNode,
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
} from 'graphql';

import {TextBuilder} from '../utils';

export type Globals = {
  readonly schema: GraphQLSchema;
  readonly fragments: ReadonlyMap<string, FragmentDefinitionNode>;
  readonly sharedDefinitionsPath: string;
  readonly operationTypeNames: {
    query: string | undefined;
    mutation: string | undefined;
    subscription: string | undefined;
  };

  useType(type: ImportedType): string;
};

export type OperationParams = {
  ownFragments: ReadonlyMap<string, FragmentDefinitionNode>;
} & Globals;

export type TypeWriterParams = {
  readonly schema: GraphQLSchema;
  useType(type: ImportedType): string;
  useFragment(name: string): FragmentDefinitionNode;
  writeSelection(
    result: TextBuilder,
    type: ObjectLikeType,
    selections: readonly SelectionNode[]
  ): void;
};

export type TypedOperation = {
  /** The name of the operation, or null if it is anonymous. */
  name: string | null;
  /**
   * The minified text of the operation, which is sent to the GraphQL server.
   * This value is not escaped in any way; it will be serialized as JSON in
   * order to become a valid TS string literal.
   */
  text: string;
  /** The argument and result type of the operation, as TS code. */
  type: string;
};

/** All kinds of types that fields can be selected from. */
export type ObjectLikeType =
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType;

/**
 * Types that are imported from a shared definition file when referenced in
 * a selection set or used as input types.
 */
export type ImportedType =
  | GraphQLScalarType
  | GraphQLEnumType
  | GraphQLInputObjectType;
