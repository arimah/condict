import {ElementType, MarkType, LinkTarget} from './types';

declare module 'slate/dist/interfaces/element' {
  interface Element {
    type: ElementType;
    // For blocks
    indent?: number;
    // For links
    target?: LinkTarget;
  }
}

declare module 'slate/dist/interfaces/text' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Text extends Partial<Record<MarkType, boolean>> {
  }
}
