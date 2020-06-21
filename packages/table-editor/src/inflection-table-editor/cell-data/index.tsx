import React from 'react';

import InflectionPattern from '../../inflection-pattern';
import {DoNotDeriveLemmaIcon, CustomDisplayNameIcon} from '../../icons';
import {CellDataProps} from '../../table-cell';

import Value from '../value';

import * as S from './styles';

export type Props = CellDataProps<Value>;

const CellData = ({cell, editing, disabled}: Props): JSX.Element => {
  const {data} = cell;
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
