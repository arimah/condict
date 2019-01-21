/**
 * Given a React element and a string label, returns an array of two elements:
 *
 * - The visible content of the control
 * - The ARIA label to be passed to `aria-label`.
 *
 * Using this function allows components to render their `label` property as
 * content, unless children are present, in which case they get precedence.
 * (WAI-ARIA guidelines: prefer visible labels.)
 *
 * Example usage:
 *
 * ```jsx
 * const MyButton = ({children, label, ...rest}) => {
 *   const [content, ariaLabel] = getContentAndLabel(children, label);
 *   return (
 *     <button {...rest} aria-label={ariaLabel}>
 *       {content}
 *     </button>
 *   );
 * }
 *
 * // Only `label`, which is rendered inside the button:
 * <MyButton label='Next item'/>;
 *
 * // Only children, which are also rendered inside the button (the text node
 * // is read by assistive technologies):
 * <MyButton>Next item <ArrowRightIcon/></MyButton>
 *
 * // `label` and children mixed; children are shown, and the label becomes
 * // the accessible text:
 * <MyButton label='Next item'><ArrowRightIcon/></MyButton>
 * ```
 *
 *
 * @param {*} children
 * @param {string} label
 * @return {Array.<*>}
 */
export const getContentAndLabel = (children, label) => {
  // Let the rendered content describe the control as far as possible, so
  // as to avoid bloating the DOM.
  // If there are no `children`, we use `label` as the rendered content.
  if (children != null) {
    return [children, label || undefined];
  } else {
    return [label, undefined];
  }
};
