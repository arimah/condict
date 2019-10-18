import React, {Component, Ref} from 'react';
import createFocusTrap, {
  FocusTrap as FocusTrapImpl,
  Options as FocusTrapOptions,
} from 'focus-trap';

import combineRefs from './combine-refs';

/**
 * The code in this file is a rewrite of focus-trap-react, whose existence is
 * motivated by three concerns:
 *
 * 1. I need access to the `allowOutsideClick` API, which was introduced in
 *    focus-trap@5.0.2, but focus-trap-react has not been updated to use that
 *    version.
 * 2. focus-trap-react uses the deprecated findDOMNode API, but we can leverage
 *    TypeScript to guarantee that the single child has an HTMLElement ref.
 * 3. focus-trap-react has no support for RefObject; if the child's ref is a
 *    RefObject, it will never be updated with the current element.
 *
 * This new implementation is not a perfect drop-in replacement. It only works
 * with children whose ref resolves to an HTMLElement, and `focusTrapOptions`
 * has been renamed to the less intrusive `options`.
 *
 * Duplicating focus-trap-react is not ideal.
 */

export {Options as FocusTrapOptions} from 'focus-trap';

type HTMLElementChild = JSX.Element & {
  ref?: Ref<HTMLElement>;
};

export type Props<C extends HTMLElementChild> = {
  active: boolean;
  paused: boolean;
  options: FocusTrapOptions;
  children: C;
};

class FocusTrap<C extends HTMLElementChild> extends Component<Props<C>> {
  public static defaultProps = {
    active: true,
    paused: false,
    options: {},
  };

  private focusTrap: FocusTrapImpl | undefined;
  private previousFocus: Element | null = document.activeElement;
  private focusTrapElement = React.createRef<HTMLElement>();

  public componentDidMount() {
    // React may move focus into the element before we've finished mounting
    // (e.g. due to autoFocus), so we need to handle returnFocusOnDeactivate
    // ourselves, by keeping track of the previously focused element.
    const options: FocusTrapOptions = {
      ...this.props.options,
      returnFocusOnDeactivate: false,
    };

    this.focusTrap = createFocusTrap(
      this.focusTrapElement.current as HTMLElement,
      options
    );
    if (this.props.active) {
      this.focusTrap.activate();
    }
    if (this.props.paused) {
      this.focusTrap.pause();
    }
  }

  public componentDidUpdate(prevProps: Props<C>) {
    const nextProps = this.props;

    if (!this.focusTrap) {
      return;
    }

    if (prevProps.active !== nextProps.active) {
      if (nextProps.active) {
        this.focusTrap.activate();
      } else {
        const {returnFocusOnDeactivate = true} = nextProps.options;
        this.focusTrap.deactivate({
          returnFocus: returnFocusOnDeactivate,
        });
      }
    }

    if (prevProps.paused !== nextProps.paused) {
      if (nextProps.paused) {
        this.focusTrap.pause();
      } else {
        this.focusTrap.unpause();
      }
    }
  }

  public componentWillUnmount() {
    if (!this.focusTrap) {
      return;
    }
    this.focusTrap.deactivate();
    const {returnFocusOnDeactivate = true} = this.props.options;
    if (
      returnFocusOnDeactivate &&
      this.previousFocus &&
      (this.previousFocus as any).focus
    ) {
      (this.previousFocus as any).focus();
    }
  }

  public render() {
    const {children} = this.props as Props<C>;

    const childWithRef = React.cloneElement(children, {
      ref: combineRefs(children.ref, this.focusTrapElement),
    });
    return childWithRef;
  }
}

export default FocusTrap;
