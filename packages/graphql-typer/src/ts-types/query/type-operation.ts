import {
  OperationDefinitionNode,
  FragmentDefinitionNode,
  isObjectType,
} from 'graphql';

import formatLoc from '../../format-loc';
import {minifyOperation, minifyFragment} from '../../graphql/minify';

import {TextBuilder} from '../utils';

import typeParameters from './type-parameters';
import writeObjectSelection from './object-selection';
import writeAbstractSelection from './abstract-selection';
import {TypedOperation, OperationParams, TypeWriterParams} from './types';

const getTypeWriterParams = (
  params: OperationParams,
  usedFragments: Map<string, FragmentDefinitionNode>
): TypeWriterParams => {
  const typeParams: TypeWriterParams = {
    schema: params.schema,
    useType: type => params.useType(type),
    useFragment: (name, loc) => {
      const fragment =
        params.ownFragments.get(name) ||
        params.fragments.get(name);
      if (!fragment) {
        throw new Error(`${formatLoc(loc)}: Unknown fragment: ${name}`);
      }
      usedFragments.set(name, fragment);
      return fragment;
    },
    writeSelection: (result, type, selection) => {
      if (isObjectType(type)) {
        writeObjectSelection(typeParams, result, type, selection);
      } else {
        writeAbstractSelection(typeParams, result, type, selection);
      }
    },
  };
  return typeParams;
};

const getOperationRootType = (
  params: OperationParams,
  op: OperationDefinitionNode
) => {
  let type;
  switch (op.operation) {
    case 'query':
      type = params.schema.getQueryType();
      break;
    case 'mutation':
      type = params.schema.getMutationType();
      break;
    case 'subscription':
      type = params.schema.getSubscriptionType();
      break;
  }
  if (!type) {
    throw new Error(`No type defined for this operation: ${op.operation}`);
  }
  return type;
};

const typeOperation = (
  params: OperationParams,
  op: OperationDefinitionNode
): TypedOperation => {
  const name = op.name ? op.name.value : null;

  const usedFragments = new Map<string, FragmentDefinitionNode>();
  const typeText = new TextBuilder();

  const typeParams = getTypeWriterParams(params, usedFragments);
  const opType = getOperationRootType(params, op);

  typeText.append(`${opType.name}<`);
  typeParameters(
    typeParams,
    typeText,
    op.variableDefinitions
  );
  typeText.append(', ');
  writeObjectSelection(
    typeParams,
    typeText,
    opType,
    op.selectionSet.selections
  );
  typeText.append('>');

  return {
    name,
    text: `${minifyOperation(op)}${
      Array.from(usedFragments.values())
        .map(minifyFragment)
        .join('')
    }`,
    type: typeText.toString(),
  };
};

export default typeOperation;
