import {Ref, RefObject} from 'react';

export type ElementChild = JSX.Element & {
  ref?: Ref<Element>;
};

export type FocusableElement = Element & {
  focus(): void;
};

export const isFocusableElement = (elem: Element): elem is FocusableElement =>
  typeof (elem as any).focus === 'function';

export type ElementSource<E extends Element = Element> =
  | RefObject<E>
  | (() => E | null);

export const elementFromSource = <E extends Element>(
  source: ElementSource<E>
) =>
  typeof source === 'function'
    ? source()
    : source.current;

export enum FocusScopeBehavior {
  /**
   * The elements in the focus scope are not treated specially. Basically
   * you can tab through them like any other set of elements.
   */
  NORMAL = 'normal',
  /**
   * The elements in the focus scope should be excluded from the normal tab
   * order. They cannot be clicked or focused.
   */
  EXCLUDE = 'exclude',
  /**
   * Focus will be contained within the focus scope. If there are multiple
   * scopes with this behaviour, focus can move freely between them but not
   * into any other focus scope.
   */
  CONTAIN = 'contain',
}

export type FocusScopeState = {
  root: RefObject<Element>;
  behavior: FocusScopeBehavior;
  onPointerDownOutside?: (target: Element) => void;
};
