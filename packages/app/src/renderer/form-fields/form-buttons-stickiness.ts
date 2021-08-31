import {Ref, useEffect, useRef} from 'react';

export type StickinessChangeHandler = (stuck: boolean) => void;

const useFormButtonsStickiness = (
  callback: StickinessChangeHandler
): Ref<HTMLDivElement> => {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) {
      console.warn('useFormButtonsStickiness: No target after mount!');
      return;
    }

    observeStickiness(target, callback);

    return () => {
      unobserveStickiness(target);
    };
  }, []);

  return targetRef;
};

export default useFormButtonsStickiness;

let intersectionObserver: IntersectionObserver | null = null;
const stickinessObservers = new Map<Element, StickinessChangeHandler>();
const stickinessStates = new Map<Element, boolean>();

const getIntersectionObserver = (): IntersectionObserver => {
  if (!intersectionObserver) {
    const handleChange: IntersectionObserverCallback = entries => {
      for (const entry of entries) {
        if (entry.intersectionRatio === 0) {
          // The element is totally invisible. Very likely the tab has been
          // moved to the background. Ignore the entry.
          continue;
        }

        const client = entry.boundingClientRect;
        const intersection = entry.intersectionRect;
        // The element is stuck if its bottom is outside the intersection rect.
        // This happens because of the `bottom: -1px` rule in our CSS, which
        // ensures a stuck element is *just outside* its container.
        const stuck = client.bottom > intersection.bottom;
        const handler = stickinessObservers.get(entry.target);
        const wasStuck = stickinessStates.get(entry.target);

        // Only call the handler when the stickiness *changes*. This prevents
        // a cascade of re-renders when the panel enters, and the intersection
        // rectangle updates frequently.
        if (stuck !== wasStuck) {
          handler?.(stuck);
          stickinessStates.set(entry.target, stuck);
        }
      }
    };

    intersectionObserver = new IntersectionObserver(handleChange, {
      threshold: [0, 1],
    });
  }
  return intersectionObserver;
};

const observeStickiness = (
  target: Element,
  callback: StickinessChangeHandler
) => {
  const intersectionObserver = getIntersectionObserver();
  stickinessObservers.set(target, callback);
  intersectionObserver.observe(target);
};

const unobserveStickiness = (target: Element) => {
  const intersectionObserver = getIntersectionObserver();
  stickinessObservers.delete(target);
  stickinessStates.delete(target);
  intersectionObserver.unobserve(target);
};
