import * as S from './styles';

export type Props = {
  snippet: Snippet;
};

export interface Snippet {
  readonly partialStart: boolean;
  readonly partialEnd: boolean;
  readonly parts: readonly SnippetPart[];
}

export interface SnippetPart {
  readonly isMatch: boolean;
  readonly text: string;
}

const HighlightedSnippet = (props: Props): JSX.Element => {
  const {snippet} = props;

  const children: (JSX.Element | string)[] = [];
  if (snippet.partialStart) {
    children.push(<S.Ellipsis key='dots-start'>...</S.Ellipsis>);
  }

  // So we can generate a unique and stable key for each match.
  let matchIndex = 0;
  for (const part of snippet.parts) {
    if (part.isMatch) {
      children.push(
        <S.Highlight key={`match-${++matchIndex}`}>
          {part.text}
        </S.Highlight>
      );
    } else {
      children.push(part.text);
    }
  }

  if (snippet.partialEnd) {
    children.push(<S.Ellipsis key='dots-end'>...</S.Ellipsis>);
  }

  return <>{children}</>;
};

export default HighlightedSnippet;
