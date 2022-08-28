import React from 'react';

import {
  Shade,
  Red,
  Orange,
  Yellow,
  Green,
  Teal,
  Blue,
  Purple,
  Gray,
} from '@condict/ui';

import {ColorName} from '../../../../types';

import ColorOption from './option';
import * as S from './styles';

export type Props = {
  name: string;
  value: ColorName;
  onChange: (value: ColorName) => void;
};

const AllColors: readonly ColorName[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'gray',
];

const Shades: Record<ColorName, Shade> = {
  red: Red,
  orange: Orange,
  yellow: Yellow,
  green: Green,
  teal: Teal,
  blue: Blue,
  purple: Purple,
  gray: Gray,
};

const ColorOptions = React.memo((props: Props): JSX.Element => {
  const {name: radioName, value, onChange} = props;
  return (
    <S.Main>
      {AllColors.map(colorName =>
        <ColorOption
          key={colorName}
          name={radioName}
          value={colorName}
          shade={Shades[colorName]}
          selected={colorName === value}
          onChange={onChange}
        />
      )}
    </S.Main>
  );
});

ColorOptions.displayName = 'ColorOptions';

export default ColorOptions;
