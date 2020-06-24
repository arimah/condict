import React from 'react';

import {DoNotDeriveLemmaIcon, CustomDisplayNameIcon} from '../../icons';
import InflectionPattern from '../../inflection-pattern';
import {CellDataProps} from '../../types';

import {InflectionTableData} from '../types';

import * as S from './styles';

export type Props = CellDataProps<InflectionTableData>;

const CellData = ({cell, data, editing, disabled}: Props): JSX.Element => {
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
      <S.CellIcons disabled={disabled} aria-hidden='true'>
        {!data.deriveLemma && <DoNotDeriveLemmaIcon/>}
        {data.hasCustomDisplayName && <CustomDisplayNameIcon/>}
      </S.CellIcons>}
  </>;
};

export default CellData;
