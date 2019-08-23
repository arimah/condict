import {GraphQLType} from 'graphql';

export type TypeWriter = (type: GraphQLType, input: boolean) => string;
