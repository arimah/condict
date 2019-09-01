import {
  ArgumentNode,
  DirectiveNode,
  FieldNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  OperationDefinitionNode,
  SelectionSetNode,
  TypeNode,
  ValueNode,
} from 'graphql';

import {TextBuilder} from '../ts-types/utils';

import formatString from './format-string';

// In hindsight, writing my own minifier might have been a bit silly.

const needCommaBeforeIdent = (text: TextBuilder) =>
  !text.matches(/[)\]}]$/);

const writeType = (type: TypeNode): string => {
  switch (type.kind) {
    case 'NonNullType':
      return `${writeType(type.type)}!`;
    case 'ListType':
      return `[${writeType(type.type)}]`;
    case 'NamedType':
      return type.name.value;
  }
};

const writeValue = (result: TextBuilder, value: ValueNode) => {
  switch (value.kind) {
    case 'NullValue':
      result.append('null');
      break;
    case 'BooleanValue':
      result.append(value.value ? 'true' : 'false');
      break;
    case 'EnumValue':
    case 'FloatValue':
    case 'IntValue':
      result.append(value.value);
      break;
    case 'ListValue':
      result.append('[');
      // Commas are not always required as separators, but for the sake of
      // simplicity, we will always insert them here. Not quite minifying,
      // but good enough.
      value.values.forEach((v, index) => {
        if (index > 0) {
          result.append(',');
        }
        writeValue(result, v);
      });
      result.append(']');
      break;
    case 'ObjectValue':
      result.append('{');
      // Same here - we don't really *need* commas everywhere, but it does
      // rather simplify the logic.
      value.fields.forEach((field, index) => {
        if (index > 0) {
          result.append(',');
        }
        result.append(`${field.name.value}:`);
        writeValue(result, field.value);
      });
      result.append('}');
      break;
    case 'StringValue':
      result.append(formatString(value.value));
      break;
    case 'Variable':
      result.append(`$${value.name.value}`);
      break;
  }
};

const writeArguments = (result: TextBuilder, args: readonly ArgumentNode[]) => {
  result.append('(');
  args.forEach((arg, index) => {
    if (index > 0 && needCommaBeforeIdent(result)) {
      result.append(',');
    }
    result.append(`${arg.name.value}:`);
    writeValue(result, arg.value);
  });
  result.append(')');
};

const writeDirectives = (
  result: TextBuilder,
  directives: readonly DirectiveNode[]
) => {
  directives.forEach(dir => {
    result.append(`@${dir.name.value}`);
    if (dir.arguments && dir.arguments.length > 0) {
      writeArguments(result, dir.arguments);
    }
  });
};

let writeSelectionSet: (
  result: TextBuilder,
  selections: SelectionSetNode
) => void;

const writeField = (result: TextBuilder, field: FieldNode) => {
  if (field.alias) {
    result.append(`${field.alias}:`);
  }
  result.append(field.name.value);
  if (field.arguments && field.arguments.length > 0) {
    writeArguments(result, field.arguments);
  }
  if (field.directives && field.directives.length > 0) {
    writeDirectives(result, field.directives);
  }
  if (field.selectionSet) {
    writeSelectionSet(result, field.selectionSet);
  }
};

const writeFragmentSpread = (
  result: TextBuilder,
  spread: FragmentSpreadNode
) => {
  result.append(`...${spread.name.value}`);
  if (spread.directives && spread.directives.length > 0) {
    writeDirectives(result, spread.directives);
  }
};

const writeInlineFragment = (
  result: TextBuilder,
  fragment: InlineFragmentNode
) => {
  result.append(`...`);
  if (fragment.typeCondition) {
    result.append(`on ${fragment.typeCondition.name.value}`);
  }
  if (fragment.directives && fragment.directives.length > 0) {
    writeDirectives(result, fragment.directives);
  }
  writeSelectionSet(result, fragment.selectionSet);
};

writeSelectionSet = (result, selections) => {
  result.append('{');
  selections.selections.forEach((sel, index) => {
    switch (sel.kind) {
      case 'Field':
        if (index > 0 && needCommaBeforeIdent(result)) {
          result.append(',');
        }
        writeField(result, sel);
        break;
      case 'FragmentSpread':
        writeFragmentSpread(result, sel);
        break;
      case 'InlineFragment':
        writeInlineFragment(result, sel);
        break;
    }
  });
  result.append('}');
};

export const minifyOperation = (op: OperationDefinitionNode): string => {
  const result = new TextBuilder();

  // First the operation type - 'query', 'mutation' or 'subscription'.
  result.append(op.operation);
  if (op.name) {
    result.append(` ${op.name.value}`);
  }

  if (op.variableDefinitions && op.variableDefinitions.length > 0) {
    result.append('(');
    op.variableDefinitions.forEach((def, index) => {
      if (index > 0) {
        result.append(',');
      }

      result
        .append(`$${def.variable.name.value}:`)
        .append(writeType(def.type));
    });
    result.append(')');
  }

  if (op.directives && op.directives.length > 0) {
    writeDirectives(result, op.directives);
  }

  writeSelectionSet(result, op.selectionSet);

  return result.toString();
};

export const minifyFragment = (fragment: FragmentDefinitionNode): string => {
  const result = new TextBuilder();
  result.append(
    `fragment ${fragment.name.value} on ${fragment.typeCondition.name.value}`
  );

  if (fragment.directives && fragment.directives.length > 0) {
    writeDirectives(result, fragment.directives);
  }

  writeSelectionSet(result, fragment.selectionSet);

  return result.toString();
};
