export interface Snippet {
  readonly partialStart: boolean;
  readonly partialEnd: boolean;
  readonly parts: readonly SnippetPart[];
}

export interface SnippetPart {
  readonly isMatch: boolean;
  readonly text: string;
}
