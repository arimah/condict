import styled, {css} from 'styled-components';
import {Editable as BaseEditable} from 'slate-react';

import {Toolbar as ToolbarBase} from '@condict/ui';

import {EditorStyles as BlockStyles} from './block-styles';

export const Link = 'a';

export const Superscript = 'sup';

export const Subscript = 'sub';

export type ToolbarProps = {
  alwaysVisible: boolean;
};

export const Toolbar = styled(ToolbarBase)<ToolbarProps>`
  padding: 2px;
  border: 2px solid ${p => p.theme.general.border};
  border-radius: 3px 3px 0 0;

  ${p => p.alwaysVisible ? `
    margin-bottom: 8px;
    position: sticky;
    top: 0;
    z-index: 1;
  ` : css<ToolbarProps>`
    margin-bottom: -3px;
    padding-bottom: 5px;
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    overflow: hidden;
    max-height: 10px;
    border-bottom-width: 0;
    pointer-events: none;
    transform: translate(0, 100%) translate(0, 1px);

    transition-property: max-height, transform, opacity, box-shadow;
    transition-duration: ${p => p.theme.timing.short}ms;
    transition-timing-function: ease-in-out;
  `}
`;

export type EditorContainerProps = {
  toolbarAlwaysVisible: boolean;
  singleLine: boolean;
};

const SingleLineStyles = `
  p {
    margin-top: 2px;
    margin-bottom: 2px;
  }
`;

export type EditableProps = {
  $singleLine: boolean;
  $toolbarAlwaysVisible: boolean;
};

export const Editable = styled(BaseEditable)<EditableProps>`
  padding: ${p => p.$singleLine ? '0 2px' : '0 6px'};
  position: relative;
  border: 2px solid ${p => p.theme.general.border};
  border-radius: 3px;
  background-color: ${p => p.theme.defaultBg};
  color: ${p => p.theme.defaultFg};

  ${p => p.$toolbarAlwaysVisible ? `
    margin-top: -10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  ` : css`
    &:focus {
      outline: none;
      border-color: ${p => p.theme.focus.color};
      box-shadow: ${p => p.theme.focus.shadow};
    }
  `}

  ${p => p.$singleLine ? SingleLineStyles : BlockStyles}

  ${Superscript} {
    font-size: 12px;
    line-height: 13px;
    vertical-align: 4px;
  }

  ${Subscript} {
    font-size: 12px;
    line-height: 13px;
    vertical-align: -3px;
  }

  ${Link}:link,
  ${Link}:visited,
  ${Link}:hover,
  ${Link}:active {
    color: ${p => p.theme.link.link};
  }
`;

export const EditorContainer = styled.div<EditorContainerProps>`
  margin-top: 16px;
  margin-bottom: 16px;
  position: relative;

  ${p => !p.toolbarAlwaysVisible && css`
    &:focus-within {
      > ${Toolbar} {
        max-height: 150%;
        transform: translate(0, 0);
        pointer-events: auto;
        box-shadow: ${p => p.theme.shadow.elevation1};
      }
    }
  `}
`;
