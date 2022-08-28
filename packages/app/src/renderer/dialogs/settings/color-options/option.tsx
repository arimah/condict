import {Localized} from '@fluent/react';

import {Shade} from '@condict/ui';

import {ColorName} from '../../../../types';

import * as S from './styles';

export type Props = {
  name: string;
  value: ColorName;
  shade: Shade;
  selected: boolean;
  onChange: (value: ColorName) => void;
};

const ColorOption = (props: Props): JSX.Element => {
  const {name, value, shade, selected, onChange} = props;
  return (
    <S.Option>
      <input
        type='radio'
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
      />
      <S.Swatch style={{backgroundColor: shade.swatch}}/>
      <S.ColorName>
        <Localized id={`settings-color-name-${value}`}/>
      </S.ColorName>
    </S.Option>
  );
};

export default ColorOption;
