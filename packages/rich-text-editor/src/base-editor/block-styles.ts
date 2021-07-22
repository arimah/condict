import styled, {css} from 'styled-components';

import {MaxIndent} from '../node-utils';

export const Paragraph = 'p';

export const Heading1 = 'h2';

export const Heading2 = 'h3';

/** An array from 0 up to MaxIndent. */
const IndentLevels = Array.from({length: MaxIndent + 1}, (_, i) => i);

const Indent = 32; // pixels

const ListItem = styled.div`
  position: relative;
  margin-top: 2px;
  margin-bottom: 2px;
  padding-inline-start: ${Indent}px;

  ${IndentLevels
    .map(level =>  `&[data-indent='${level}'] + :not([data-indent='${level}'])`)
    .join(',')
  } {
    margin-top: 8px;
  }
`;

export const BulletListItem = styled(ListItem)`
  &::before {
    content: '•\\A0';
    margin-inline-end: 6px;
    position: absolute;
    inset-inline-end: calc(100% - ${Indent}px);
  }
`;

export const NumberListItem = styled(ListItem)`
  &::before {
    content: '#.\\A0';
    position: absolute;
    inset-inline-end: calc(100% - ${Indent}px);
  }

  ${IndentLevels.map(level => `
    &[data-indent='${level}'] {
      counter-increment: list${level};
      &::before {
        content: counter(list${level}) '.\\A0';
      }
    }
  `)}
`;

export const EditorStyles = css`
  ${IndentLevels.map(level => `
    [data-indent='${level}'] {
      margin-inline-start: ${level * Indent}px;
      counter-reset: ${
        // Reset every list counter higher than this.
        IndentLevels.slice(level + 1).map(l => `list${l}`).join(' ')
      };
    }
  `)}

  line-height: 20px;

  ${Heading1} {
    margin-block: 16px 8px;
    font-size: 20px;
    line-height: 24px;
  }

  ${Heading2} {
    margin-block: 12px 4px;
    font-size: 18px;
    line-height: 20px;
  }

    /* Reduce spacing around headings at the beginning and end. */

    ${Heading1}:first-child,
    ${Heading2}:first-child {
      margin-top: 8px;
    }

    ${Heading1}:last-child,
    ${Heading2}:last-child {
      margin-bottom: 8px;
    }

  /* Extra space at the beginning, to mimic a "real" list. */
  ${NumberListItem}:first-child,
  ${BulletListItem}:first-child,
  /* Different list styles, even at the same level of nesting, must be
   * given some extra spacing.
   */
  ${NumberListItem} + ${BulletListItem},
  ${BulletListItem} + ${NumberListItem} {
    margin-top: 8px;
  }

  /* Extra space at the end, to mimic a "real" list. */
  ${NumberListItem}:last-child,
  ${BulletListItem}:last-child {
    margin-bottom: 8px;
  }
`;
