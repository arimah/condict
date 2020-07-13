import {
  DirectiveNode,
  SelectionNode,
  NamedTypeNode,
  GraphQLOutputType,
  GraphQLNamedType,
  Location,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isUnionType,
} from 'graphql';

import formatLoc from '../../format-loc';
import {getDirective, getArgument} from '../../graphql/helpers';

import {ObjectLikeType, TypeWriterParams} from './types';

export const getObjectLikeInnerType = (
  type: GraphQLOutputType
): ObjectLikeType | null => {
  if (isNonNullType(type)) {
    return getObjectLikeInnerType(type.ofType);
  }
  if (isListType(type)) {
    return getObjectLikeInnerType(type.ofType);
  }
  if (
    isObjectType(type) ||
    isInterfaceType(type) ||
    isUnionType(type)
  ) {
    return type;
  }
  return null;
};

const getConditionValue = (directive: DirectiveNode): 'yes' | 'no' | 'maybe' => {
  const ifArgument = getArgument(directive, 'if');
  if (ifArgument && ifArgument.value.kind === 'BooleanValue') {
    return ifArgument.value.value ? 'yes' : 'no';
  }
  return 'maybe';
};

export const enum SelectionInclusion {
  INCLUDE = 'yes',
  SKIP = 'no',
  DEPENDS = 'maybe',
}

export const isSelectionIncluded = (sel: SelectionNode): SelectionInclusion => {
  // Fast path: if there are no directives, the node is always includeed.
  if (!sel.directives || sel.directives.length === 0) {
    return SelectionInclusion.INCLUDE;
  }

  const skipDirective = getDirective(sel, 'skip');
  const skip = skipDirective ? getConditionValue(skipDirective) : 'no';

  const includeDirective = getDirective(sel, 'include');
  const include = includeDirective ? getConditionValue(includeDirective) : 'yes';

  // @skip(if: true) and @include(if: false) always result in omission.
  if (skip === 'yes' || include === 'no') {
    return SelectionInclusion.SKIP;
  }
  // At this point, skip = 'no' | 'maybe', include = 'yes' | 'maybe'.
  // If either is 'maybe', then we won't know until the query is excuted.
  if (skip === 'maybe' || include === 'maybe') {
    return SelectionInclusion.DEPENDS;
  }
  return SelectionInclusion.INCLUDE;
};

export const validateFragmentType = (
  params: TypeWriterParams,
  expectedTypes: readonly GraphQLNamedType[],
  {name: {value: fragmentTypeName}}: NamedTypeNode,
  fragmentName: string | null,
  loc: Location | undefined
): GraphQLNamedType => {
  const fragmentType = params.schema.getType(fragmentTypeName);
  if (!fragmentType) {
    throw new Error(
      `${formatLoc(loc)}: ${
        fragmentName
          ? `Fragment '${fragmentName}' references unknown target type: ${fragmentTypeName}`
          : `Inline fragment references unknown target type: ${fragmentTypeName}`
      }`
    );
  }
  if (!expectedTypes.includes(fragmentType)) {
    const expectedTypeNames = expectedTypes.map(t => t.name).join(' | ');
    throw new Error(
      `${formatLoc(loc)}: ${
        fragmentName
          ? `Fragment '${fragmentName}' is for type ${fragmentType.name}; expected ${expectedTypeNames}`
          : `Inline fragment is on type ${fragmentType.name}; expected ${expectedTypeNames}`
      }`
    );
  }
  return fragmentType;
};
