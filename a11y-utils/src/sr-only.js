import styled from 'styled-components';

/**
 * A styled component that renders a hidden element (by default a `<span>`)
 * whose text contents can be picked up by screen readers, to provide
 * additional accessible text where required.
 *
 * **This component should be used sparingly.** It's often better to expose
 * visible status text for _everyone_ to consume.
 *
 * The DOM node rendered by this component can be given an `id` and targetted
 * by the `aria-labelledby` or `aria-describedby` attributes.
 *
 * Since this component exists for accessibility reasons, you should obviously
 * ensure it only contains text children. Non-text content *will not* be read.
 * Do not put interactive content inside it. Do not make it focusable.
 */
export const SROnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: circle(0);
  pointer-events: none;
`;
