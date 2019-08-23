import {GraphQLScalarType} from 'graphql';

const ID_DIRECTIVE_NAME = 'id';
const KIND_ARGUMENT_NAME = 'of';

const getIdKind = (type: GraphQLScalarType): string | null => {
  const idDirective =
    type.astNode &&
    type.astNode.directives &&
    type.astNode.directives.find(d => d.name.value === ID_DIRECTIVE_NAME);

  if (idDirective) {
    const kindArgument =
      idDirective.arguments &&
      idDirective.arguments.find(a => a.name.value === KIND_ARGUMENT_NAME);
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
