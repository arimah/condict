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
  border-radius: 3px 3px 0 0;

  ${p => p.alwaysVisible ? `
    margin-bottom: -2px;
    position: sticky;
    top: 0;
    z-index: 1;
    border: 2px solid var(--input-border);
    border-bottom: none;
  ` : `
    margin-bottom: -3px;
    padding-bottom: 5px;
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    overflow: hidden;
    max-height: 10px;
    pointer-events: none;
    transform: translate(0, 100%) translate(0, 1px);

    transition-property: max-height, transform, opacity, box-shadow;
    transition-duration: ${p.theme.timing.short}ms;
    transition-timing-function: ease-in-out;
  `}
`;

export type EditorContainerProps = {
  toolbarAlwaysVisible: boolean;
  singleLine: boolean;
};

const SingleLineStyles = `
  p {
    margin-top: 4px;
    margin-bottom: 4px;
  }
`;

export type EditableProps = {
  $singleLine: boolean;
  $toolbarAlwaysVisible: boolean;
};

export const Editable = styled(BaseEditable)<EditableProps>`
  padding: ${p => p.$singleLine ? '0 4px' : '0 6px'};
  position: relative;
  border: 2px solid var(--input-border);
  background-color: var(--input-bg);
  color: var(--input-fg);

  ${p => p.$toolbarAlwaysVisible ? `
    border-radius: 0 0 3px 3px;
  ` : `
    border-radius: 3px;

    &:focus {
      outline: none;
      border-color: var(--focus-border);
    }
  `}

  ${p => p.$singleLine ? SingleLineStyles : BlockStyles}

  ${Superscript},
  ${Subscript} {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
  }

    ${Superscript} {
      vertical-align: 4px;
    }

    ${Subscript} {
      vertical-align: -3px;
    }

  ${Link}:is(:link, :visited, :hover, :active) {
    color: var(--link-fg);
  }
`;

export const EditorContainer = styled.div<EditorContainerProps>`
  margin-top: 16px;
  margin-bottom: 16px;
  position: relative;

  ${p => !p.toolbarAlwaysVisible && css`
    &:focus-within > ${Toolbar} {
      max-height: 150%;
      transform: translate(0, 0);
      pointer-events: auto;
      box-shadow: var(--shadow-elevation-1);
    }
  `}
`;
