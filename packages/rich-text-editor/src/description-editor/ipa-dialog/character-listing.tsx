import React, {Ref} from 'react';

import {IpaChar, IpaGroup} from '@condict/ipa';

import * as S from './styles';

export type Props = {
  dialogId: string;
  groups: readonly IpaGroup[];
  currentIndex: number;
  currentResultRef: Ref<HTMLElement>;
  onHover: (index: number) => void;
  onEmit: (ipa: string) => void;
};

const CharacterListing = (props: Props): JSX.Element => {
  const {
    dialogId,
    groups,
    currentIndex,
    currentResultRef,
    onHover,
    onEmit,
  } = props;

  // The current character index, incremented for each <Character/>.
  let nextCharIndex = 0;
  return <>
    {groups.map((group, groupIndex) => {
      const hasBase = group.base !== null;
      const baseIndex = hasBase ? nextCharIndex++ : -1;
      return (
        <S.Group key={groupIndex} hasBase={hasBase}>
          {group.base ? (
            <Character
              id={`${dialogId}-result-${baseIndex}`}
              char={group.base}
              isBase
              index={baseIndex}
              selected={baseIndex === currentIndex}
              onMouseEnter={onHover}
              onClick={onEmit}
              ref={baseIndex === currentIndex ? currentResultRef : undefined}
            />
          ) : (
            <S.GroupName>{group.name}</S.GroupName>
          )}
          {group.members.map((char, i) => {
            const charIndex = nextCharIndex++;
            return (
              <Character
                id={`${dialogId}-result-${charIndex}`}
                key={i}
                char={char}
                index={charIndex}
                selected={charIndex === currentIndex}
                onMouseEnter={onHover}
                onClick={onEmit}
                ref={charIndex === currentIndex ? currentResultRef : undefined}
              />
            );
          })}
        </S.Group>
      );
    })}
  </>;
};

export default CharacterListing;

type CharacterProps = {
  id: string;
  char: IpaChar;
  isBase?: boolean;
  index: number;
  selected: boolean;
  onMouseEnter: (index: number) => void;
  onClick: (ipa: string) => void;
};

const Character = React.memo(React.forwardRef((
  props: CharacterProps,
  ref: Ref<HTMLElement>
): JSX.Element => {
  const {
    id,
    char,
    isBase = false,
    index,
    selected,
    onMouseEnter,
    onClick,
  } = props;
  return (
    <S.Character
      id={id}
      isBase={isBase}
      title={char.name}
      selected={selected}
      onMouseEnter={() => onMouseEnter(index)}
      onClick={() => onClick(char.input)}
      ref={ref}
    >
      {char.display}
    </S.Character>
  );
}));

Character.displayName = 'Character';
