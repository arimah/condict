import styled, {css} from 'styled-components';
import {Editable as BaseEditable} from 'slate-react';

import {Toolbar as ToolbarBase, transition} from '@condict/ui';

import {EditorStyles as BlockStyles} from './block-styles';

export const Link = 'a';

export const Superscript = 'sup';

export const Subscript = 'sub';

export type ToolbarProps = {
  alwaysVisible: boolean;
};

export const Toolbar = styled(ToolbarBase)<ToolbarProps>`
  padding: 2px;
  border: 2px solid ${p => p.theme.general.borderColor};
  border-radius: 3px 3px 0 0;

  ${p => p.alwaysVisible ? `
    margin-bottom: 8px;
    position: sticky;
    top: 0;
    z-index: 3;
  ` : css<ToolbarProps>`
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    z-index: 1;
    overflow: hidden;
    max-height: 10px;
    border-bottom-width: 0;
    pointer-events: none;
    transform: translate(0, 100%) translate(0, 1px);

    ${transition('max-height, transform, opacity')};
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
  z-index: 2;
  background-color: ${p => p.theme.general.bg};
  border: 2px solid ${p => p.theme.general.borderColor};
  border-radius: 3px;

  ${transition('border-radius')}

  ${p => p.$toolbarAlwaysVisible ? `
    margin-top: -10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  ` : css`
    &:focus {
      ${p => p.theme.focus.style}
      outline: none;
      border-color: ${p => p.theme.focus.color};
    }
  `}

  ${p => p.$singleLine ? SingleLineStyles : BlockStyles}

  ${Superscript} {
    font-size: 0.85em;
    vertical-align: 4px;
  }

  ${Subscript} {
    font-size: 0.85em;
    vertical-align: -3px;
  }

  ${Link}:link,
  ${Link}:visited,
  ${Link}:hover,
  ${Link}:active {
    color: ${p => p.theme.link.color};
  }
`;

export const EditorContainer = styled.div<EditorContainerProps>`
  margin-top: 16px;
  margin-bottom: 16px;
  position: relative;
  z-index: 0;

  ${p => !p.toolbarAlwaysVisible && `
    &:focus-within {
      > ${Editable} {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }

      > ${Toolbar} {
        max-height: 150%;
        transform: translate(0, 0);
        pointer-events: auto;
      }
    }
  `}
`;
