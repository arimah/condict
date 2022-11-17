import {DoNotDeriveLemmaIcon, CustomDisplayNameIcon} from '../../icons';
import InflectionPattern from '../../inflection-pattern';
import {CellDataProps} from '../../types';

import {InflectionTableData, Messages} from '../types';

import * as S from './styles';

export type Props = CellDataProps<InflectionTableData, Messages>;

const CellData = (props: Props): JSX.Element => {
  const {cell, data, editing, disabled, messages} = props;

  if (cell.header) {
    return <S.CellData>{data.text || ' '}</S.CellData>;
  }

  const needIcons = !data.deriveLemma || data.hasCustomDisplayName;
  return <>
    <S.CellData>
      {editing
        ? data.text || ' '
        : <InflectionPattern
          pattern={data.text || ' '}
          disabled={disabled}
        />}
    </S.CellData>
    {needIcons &&
      <S.CellIcons $disabled={disabled} aria-hidden='true'>
        {!data.deriveLemma &&
          <DoNotDeriveLemmaIcon title={messages.noDeriveLemmaIconTitle()}/>}
        {data.hasCustomDisplayName &&
          <CustomDisplayNameIcon title={messages.hasCustomNameIconTitle()}/>}
      </S.CellIcons>}
  </>;
};

export default CellData;
