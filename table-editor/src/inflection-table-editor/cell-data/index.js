import React from 'react';
import PropTypes from 'prop-types';

import InflectionPattern from '../../inflection-pattern';
import {DoNotDeriveLemmaIcon, CustomDisplayNameIcon} from '../../icons';

import * as S from './styles';

const CellData = ({cell, editing, disabled}) => {
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
      <S.CellIcons disabled={disabled}>
        {!data.deriveLemma && <DoNotDeriveLemmaIcon/>}
        {data.hasCustomDisplayName && <CustomDisplayNameIcon/>}
      </S.CellIcons>}
  </>;
};

CellData.propTypes = {
  cell: PropTypes.any.isRequired,
  editing: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default CellData;
