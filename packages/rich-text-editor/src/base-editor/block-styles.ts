import styled, {css} from 'styled-components';

import {MaxIndent} from '../node-utils';

export const Paragraph = 'p';

export const Heading1 = 'h2';

export const Heading2 = 'h3';

/** An array from 0 up to MaxIndent. */
const IndentLevels = Array.from({length: MaxIndent + 1}, (_, i) => i);

/** An array from 1 up to MaxIndent. */
const ListLevels = IndentLevels.slice(1);

const ListItem = styled.div`
  position: relative;
  margin-top: 4px;
  margin-bottom: 4px;

  ${ListLevels
    .map(level =>  `&[data-indent='${level}'] + :not([data-indent='${level}'])`)
    .join(',')
  } {
    margin-top: 8px;
  }
`;

export const BulletListItem = styled(ListItem)`
  &::before {
    content: '•\\A0';
    margin-right: 6px;
    position: absolute;
    right: 100%;
  }
`;

export const NumberListItem = styled(ListItem)`
  &::before {
    content: '#.\\A0';
    position: absolute;
    right: 100%;
  }

  ${ListLevels.map(level => `
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
      margin-left: ${level * 32}px;
      counter-reset: ${
        // Reset every list counter higher than this.
        IndentLevels.slice(level + 1).map(l => `list${l}`).join(' ')
      };
    }
  `)}

  ${Heading1} {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: 1.3em;
  }

  ${Heading2} {
    margin-top: 12px;
    margin-bottom: 4px;
    font-size: 1.10em;
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
