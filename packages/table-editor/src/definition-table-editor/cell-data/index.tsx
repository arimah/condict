import React, {useContext} from 'react';

import {inflectWord} from '@condict/inflect';

import {CellDataProps} from '../../types';

import StemsContext from '../stems-context';
import {DefinitionTableData} from '../types';

import * as S from './styles';

export type Props = CellDataProps<DefinitionTableData>;

const CellData = ({cell, data, disabled}: Props): JSX.Element => {
  if (cell.header) {
    return <S.CellData>{data.text}</S.CellData>;
  }
  if (data.customForm !== null) {
    return (
      <S.CellData custom disabled={disabled}>
        {data.customForm || <S.DeletedForm disabled={disabled}/>}
      </S.CellData>
    );
  }
  return (
    <S.CellData inflected disabled={disabled}>
      <InflectedForm pattern={data.text}/>
    </S.CellData>
  );
};

export default CellData;

type InflectedFormProps = {
  pattern: string;
};

const InflectedForm = React.memo((props: InflectedFormProps) => {
  const {pattern} = props;
  const {term, stems} = useContext(StemsContext);

  // FIXME: Render a plain string when TypeScript allows us to.
  return <>{inflectWord(pattern, term, stems)}</>;
});

InflectedForm.displayName = 'InflectedForm';
