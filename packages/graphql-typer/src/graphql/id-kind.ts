import {GraphQLScalarType} from 'graphql';

import {getDirective, getArgument} from './helpers';

const getIdKind = (type: GraphQLScalarType): string | null => {
  const idDirective =
    type.astNode &&
    getDirective(type.astNode, 'id');

  if (idDirective) {
    const kindArgument = getArgument(idDirective, 'of');
    const idKind =
      (
        kindArgument &&
        kindArgument.value.kind === 'StringValue' &&
        kindArgument.value.value
      ) ||
      type.name.replace(/Id$/, '');
    return idKind;
  }

  return null;
};

export default getIdKind;
