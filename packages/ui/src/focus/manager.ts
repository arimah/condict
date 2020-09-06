import {RefObject, useMemo, useEffect} from 'react';

import {useUniqueId} from '../unique-id';

import {getTabReachable} from './targets';
import {tryFocus, getNearestFocusable} from './utils';
import {FocusScopeProps, FocusScopeBehavior} from './types';

// Some notes on the tab handling.
//
// The basic idea is to use the browser's default tab behavior as much as
// possible, and only "fix" the focus when needed. That boils down to only
// adjusting the focus near "gaps" in the tab order. Consider this (kinda
// convoluted) document:
//
//   <Button label='A'/>
//   <FocusTrap>
//     <Button label='B'/>
//     <Button label='C'/>
//     <Button label='D'/>
//     <FocusScope active={false}>
//       <Button label='E'/>
//     </FocusScope>
//     <Button label='F'/>
//     <Button label='G'/>
//   </FocusTrap>
//   <Button label='H'/>
//   <Button label='I'/>
//
// The browser's tab sequence in this document is:
//
//   A, B, C, D, E, F, G, H, I
//
// A, H and I are unavailable because they are outside the active trap.
// Likewise, E is unavailable because it is inside a deactivated scope.
// In other words, we *want* a tab sequence like this:
//
//   -, B, C, D, -, F, G, -, -
//
// B, D, F and G are all "boundaries", because they are next to gaps in
// the native tab sequence. C has no gap on either side. When tabbing
// through this document, we can let the browser do its thing so long as
// no gap is about to be crossed. When we move from C to D, we can use
// default behavior. Pressing tab again requires intervention, skipping
// from D to F. Similarly, shift+tab on B requires us to skip over three
// gaps to get to G.

type TabGroup = {
  /**
   * The actual first reachable element in the group. Use this value to
   * focus the first element in the group.
   */
  firstReachable: Element;
  /**
   * The first element in the group. This value is null only in the first
   * group and only if there is no gap between the first and last tab-
   * reachable element.
   */
  first: Element | null;
  /**
   * The last element in the group. This value is null only in the last
   * group and only if there is no gap between the first and last tab-
   * reachable element.
   */
  last: Element | null;
};

type FocusScopeState = {
  root: Element | null;
} & FocusScopeProps;

type ScopeGroups = {
  contain: FocusScopeState[];
  exclude: FocusScopeState[];
};

const nextTick = (cb: () => void): (() => void) => {
  let isQueued = false;
  return () => {
    if (!isQueued) {
      isQueued = true;
      window.setTimeout(() => {
        isQueued = false;
        cb();
      }, 1);
    }
  };
};

const needUpdate = (prev: FocusScopeState, next: FocusScopeState) =>
  prev.behavior !== next.behavior;

const needManagedFocus = (scopes: Iterable<FocusScopeState>) => {
  for (const scope of scopes) {
    if (scope.behavior !== FocusScopeBehavior.NORMAL) {
      return true;
    }
  }
  return false;
};

const getScopeRoots = (scopes: FocusScopeState[]) =>
  scopes
    .filter(s => s.root !== null)
    .map(s => s.root as Element);

const findLowestCommonParent = (elements: Element[]) =>
  elements.reduce((parent, element) => {
    if (element.contains(parent)) {
      return element;
    }
    // It should not be possible for commonParent to become null here, as the
    // elements are in the same document and we will eventually run into <body>
    let commonParent = parent;
    while (!commonParent.contains(element)) {
      commonParent = commonParent.parentNode as Element;
    }
    return commonParent;
  });

const manager = (() => {
  const scopes = new Map<string, FocusScopeState>();
  let disabledCount = 0;

  let scopeGroups: ScopeGroups | null = null;
  const getScopeGroups = (): ScopeGroups => {
    if (!scopeGroups) {
      const contain: FocusScopeState[] = [];
      const exclude: FocusScopeState[] = [];

      for (const scope of scopes.values()) {
        switch (scope.behavior) {
          case FocusScopeBehavior.CONTAIN:
            contain.push(scope);
            break;
          case FocusScopeBehavior.EXCLUDE:
            exclude.push(scope);
            break;
        }
      }

      scopeGroups = {contain, exclude};
    }
    return scopeGroups;
  };

  /**
   * Determines whether the specified element is valid focus target given the
   * current focus scopes. The possible return values are as follows:
   *
   *   - 'valid': The element is a valid focus.
   *   - 'outside-contain': The element appears outside a focus scope with
   *     the CONTAIN behavior.
   *   - 'inside-exclude': The element appears inside a focus scope with the
   *     EXCLUDE behavior.
   *
   * 'outside-contain' takes precedence over 'inside-exclude'. That is, an
   * element that is 'outside-contain' can also be 'inside-exclude', but not
   * vice versa.
   */
  const classifyElement = (
    element: Element
  ): 'valid' | 'outside-contain' | 'inside-exclude' => {
    const {contain, exclude} = getScopeGroups();
    if (
      contain.length > 0 &&
      !contain.some(e => e.root && e.root.contains(element))
    ) {
      // The element must be inside one of the 'contain' scopes, but isn't.
      return 'outside-contain';
    }
    if (
      exclude.length > 0 &&
      exclude.some(e => e.root && e.root.contains(element))
    ) {
      // The element must *not* be inside one of the 'exclude' scopes, but is.
      return 'inside-exclude';
    }
    return 'valid';
  };

  const getCurrentTabGroups = (): TabGroup[] => {
    const {contain, exclude} = getScopeGroups();

    const containRoots = getScopeRoots(contain);
    const excludeRoots = getScopeRoots(exclude);

    // If there are no contain roots, then every tab-reachable element in the
    // document is a candidate, and we must use excludeRoots to filter out
    // those we don't want. If there is one or more contain roots, we can find
    // their lowest common parent and only consider its descendants, which
    // should save us some time.
    const commonRoot =
      containRoots.length > 0
        ? findLowestCommonParent(containRoots)
        : document.body;
    const tabTargets: Element[] = getTabReachable(commonRoot, {
      includeRoot: true,
    });

    // Now we go through and mark invalid/unreachable targets and simultaneously
    // look for gaps (and their boundaries)
    const groups: TabGroup[] = [];
    let currentGroup: TabGroup | null = null;
    for (let i = 0; i < tabTargets.length; i++) {
      const target = tabTargets[i];
      const isReachable =
        (
          containRoots.length <= 1 ||
          containRoots.some(e => e.contains(target))
        ) && (
          excludeRoots.length === 0 ||
          !excludeRoots.some(e => e.contains(target))
        );

      if (currentGroup) {
        if (isReachable) {
          // Extend the group to include the current target.
          currentGroup.last = target;
        } else {
          // We have just entered a gap; end the current group.
          currentGroup = null;
        }
      } else if (isReachable) {
        // We have just left a gap; start a new group.
        const group: TabGroup = {
          firstReachable: target,
          first: target,
          last: target, // updated once we know where the end is
        };
        groups.push(group);
        currentGroup = group;
      }
    }

    if (
      containRoots.length === 0 &&
      currentGroup &&
      groups[0].first === tabTargets[0]
    ) {
      // The end "wraps around" to the start without a gap.
      groups[0].first = null;
      currentGroup.last = null;
    }

    return groups;
  };

  const getFirstFocusable = (): Element => {
    const groups = getCurrentTabGroups();
    if (groups.length > 0) {
      return groups[0].firstReachable;
    }
    // Nothing we can do :(
    return document.body;
  };

  const emitPointerDownOutside = (target: Element) => {
    const {contain} = getScopeGroups();
    contain.forEach(({onPointerDownOutside}) => {
      if (onPointerDownOutside) {
        onPointerDownOutside(target);
      }
    });
  };

  // The element that was under the pointer during the latest mousedown
  // or touchstart event. This value is set if the element was outside
  // the bounds of any active 'contain' scopes, and is cleared otherwise,
  // as well as if a key or focus event occurs. The purpose of this value
  // is to allow focus to return to it instead of the previously focused
  // element recorded by the trap, if the trap is deactivated as a result
  // of clicking outside it.
  let lastPointerDownTarget: Element | null = null;

  const handlePointerDown = (e: MouseEvent | TouchEvent) => {
    lastPointerDownTarget = null;
    if (disabledCount > 0) {
      return;
    }

    const target = e.target as Element;

    // If we have any active 'contain' scopes, not only must the target
    // be inside one of those scopes, it must also be focusable. Otherwise
    // we will end up focusing the body, which means keyboard shortcuts
    // attached to the scope will cease to work.
    const {contain} = getScopeGroups();
    let isValidTarget: boolean;
    if (contain.length > 0) {
      const nearestFocusable = getNearestFocusable(target);
      isValidTarget =
        nearestFocusable !== null &&
        classifyElement(nearestFocusable) === 'valid';
    } else {
      isValidTarget = classifyElement(target) === 'valid';
    }

    if (!isValidTarget) {
      e.preventDefault();
      if (classifyElement(target) === 'outside-contain') {
        lastPointerDownTarget = target;
        emitPointerDownOutside(target);
      }
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (disabledCount > 0) {
      return;
    }
    if (classifyElement(e.target as Element) !== 'valid') {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    lastPointerDownTarget = null;
    if (
      disabledCount > 0 ||
      e.key !== 'Tab' ||
      e.ctrlKey ||
      e.altKey ||
      e.metaKey
    ) {
      return;
    }

    // We need to handle tab events here to ensure the page does not focus an
    // invalid focus target, even for a split second, as that might cause the
    // page to scroll around.
    const groups = getCurrentTabGroups();

    const currentFocus = e.target as Element;
    if (e.shiftKey) {
      const index = groups.findIndex(g => g.first === currentFocus);
      const prevGroup = index !== -1 && groups[
        (index + groups.length - 1) % groups.length
      ];
      if (prevGroup && prevGroup.last) {
        e.preventDefault();
        tryFocus(prevGroup.last);
      }
    } else {
      const index = groups.findIndex(g => g.last === currentFocus);
      const nextGroup = index !== -1 && groups[(index + 1) % groups.length];
      if (nextGroup && nextGroup.first) {
        e.preventDefault();
        tryFocus(nextGroup.first);
      }
    }
  };

  const handleFocus = (e: FocusEvent) => {
    lastPointerDownTarget = null;
    if (disabledCount > 0) {
      return;
    }
    if (classifyElement(e.target as Element) === 'valid') {
      return;
    }
    e.stopImmediatePropagation();
    const firstFocus = getFirstFocusable();
    tryFocus(firstFocus);
  };

  const attachEvents = () => {
    document.addEventListener('mousedown', handlePointerDown, {
      capture: true,
      passive: false,
    });
    document.addEventListener('touchstart', handlePointerDown, {
      capture: true,
      passive: false,
    });
    document.addEventListener('click', handleClick, {
      capture: true,
      passive: false,
    });
    document.addEventListener('keydown', handleKeyDown, {
      capture: true,
      passive: false,
    });
    document.addEventListener('focusin', handleFocus, {
      capture: true,
      passive: false,
    });
  };
  const detachEvents = () => {
    document.removeEventListener('mousedown', handlePointerDown, true);
    document.removeEventListener('touchstart', handlePointerDown, true);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('focusin', handleFocus, true);
  };

  const ensureValidFocus = nextTick(() => {
    const current = document.activeElement;
    if (!current || classifyElement(current) !== 'valid') {
      const firstFocus = getFirstFocusable();
      tryFocus(firstFocus);
    }
  });

  let isFocusManaged = false;
  const updateScopes = nextTick(() => {
    const shouldManage = needManagedFocus(scopes.values());
    if (shouldManage !== isFocusManaged) {
      if (shouldManage) {
        attachEvents();
      } else {
        detachEvents();
      }
      isFocusManaged = shouldManage;
    }
    if (isFocusManaged) {
      ensureValidFocus();
    }
  });

  return {
    set(key: string, props: FocusScopeProps) {
      const prevState = scopes.get(key);
      const nextState: FocusScopeState = {
        root: prevState ? prevState.root : null,
        ...props,
      };
      // Not all properties affect things, so always update 'scopes'.
      scopes.set(key, nextState);
      scopeGroups = null;
      if (!prevState || needUpdate(prevState, nextState)) {
        updateScopes();
      }
    },

    getRoot(key: string): Element | null {
      const state = scopes.get(key);
      return state ? state.root : null;
    },

    setRoot(key: string, root: Element | null) {
      const state = scopes.get(key);
      if (state && state.root !== root) {
        state.root = root;
        scopeGroups = null;
        updateScopes();
      }
    },

    remove(key: string) {
      if (scopes.delete(key)) {
        scopeGroups = null;
        updateScopes();
      }
    },

    disable() {
      disabledCount += 1;
    },

    enable() {
      disabledCount = Math.max(0, disabledCount - 1);
    },

    getLastPointerDownTarget: () => lastPointerDownTarget,
  };
})();

export const useManagedFocus = (props: FocusScopeProps): RefObject<Element> => {
  const key = useUniqueId();

  manager.set(key, props);

  useEffect(() => () => manager.remove(key), []);

  const rootRef = useMemo(() => ({
    get current() {
      return manager.getRoot(key);
    },
    set current(root: Element | null) {
      manager.setRoot(key, root);
    },
  }), []);
  return rootRef;
};

// eslint-disable-next-line @typescript-eslint/unbound-method
export const disableFocusManager = manager.disable;

// eslint-disable-next-line @typescript-eslint/unbound-method
export const enableFocusManager = manager.enable;

export const getLastPointerDownTarget = manager.getLastPointerDownTarget;
