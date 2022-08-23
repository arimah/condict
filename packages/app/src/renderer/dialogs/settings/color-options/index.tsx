import {Localized} from '@fluent/react';

import {
  ShadeGroup,
  Red,
  Yellow,
  Green,
  Blue,
  Purple,
  Gray,
} from '@condict/ui';

import {ColorName} from '../../../../types';

import * as S from './styles';

export type Props = {
  name: string;
  value: ColorName;
  onChange: (value: ColorName) => void;
};

const AllColors: readonly ColorName[] = [
  'red',
  'yellow',
  'green',
  'blue',
  'purple',
  'gray',
];

const Shades: Record<ColorName, ShadeGroup> = {
  red: Red,
  yellow: Yellow,
  green: Green,
  blue: Blue,
  purple: Purple,
  gray: Gray,
};

const ColorOptions = (props: Props): JSX.Element => {
  const {name, value, onChange} = props;
  return (
    <S.Main>
      {AllColors.map(key =>
        <S.Option
          key={key}
          name={name}
          value={key}
          checked={key === value}
          onChange={e => onChange(e.target.value as ColorName)}
        >
          <S.Swatch
            shade={Shades[key]}
            $selected={key === value}
          />
          <span>
            <Localized id={`settings-color-name-${key}`}/>
          </span>
        </S.Option>
      )}
    </S.Main>
  );
};

export default ColorOptions;
