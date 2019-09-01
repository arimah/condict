import {
  ArgumentNode,
  DirectiveNode,
  ListValueNode,
  StringValueNode,
  ValueNode,
} from 'graphql';

export const assertIsList = (value: ValueNode): ListValueNode => {
  switch (value.kind) {
    case 'ListValue':
      return value;
    default:
      throw new Error('Expected a list value');
  }
};

export const assertIsString = (value: ValueNode): StringValueNode => {
  switch (value.kind) {
    case 'StringValue':
      return value;
    default:
      throw new Error('Expected a string value');
  }
};

type NodeWithDirectives = {
  readonly directives?: readonly DirectiveNode[];
};

export const getDirective = (
  node: NodeWithDirectives,
  name: string
): DirectiveNode | undefined =>
  node.directives &&
  node.directives.find(d => d.name.value === name);

type NodeWithArguments = {
  readonly arguments?: readonly ArgumentNode[];
};

export const getArgument = (
  node: NodeWithArguments,
  name: string
): ArgumentNode | undefined =>
  node.arguments &&
  node.arguments.find(a => a.name.value === name);
