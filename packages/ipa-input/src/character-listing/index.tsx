import React from 'react';

import ipa from '@condict/ipa';

import * as S from './styles';

type CharacterProps = {
  char: {
    display: string;
    name: string;
  };
  isBase?: boolean;
};

const Character = ({char, isBase = false}: CharacterProps) =>
  <S.Character isBase={isBase} title={char.name}>
    {char.display}
  </S.Character>;

const CharacterListing = (): JSX.Element =>
  // FIXME: Render the array directly when TypeScript allows it
  <>
    {ipa.getGroups().map((group, index) =>
      <S.Group key={index} hasBase={group.base !== null}>
        {group.base
          ? <Character isBase char={group.base}/>
          : <S.GroupName>{group.name}</S.GroupName>
        }
        {group.members.map((char, index) =>
          <Character key={index} char={char}/>
        )}
      </S.Group>
    )}
  </>;

export default CharacterListing;
