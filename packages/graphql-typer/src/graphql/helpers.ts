import {ListValueNode, StringValueNode, ValueNode} from 'graphql';

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
