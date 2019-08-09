import React, {useContext} from 'react';

import {CellDataProps} from '../../table-cell';

import StemsContext from '../stems-context';
import inflectWord from '../inflect-word';
import {DataFields} from '../types';

import * as S from './styles';

export type Props = CellDataProps<DataFields>;

const CellData = ({cell, disabled}: Props) => {
  if (cell.header) {
    return <S.CellData>{cell.data.text}</S.CellData>;
  }
  if (cell.data.customForm !== null) {
    return (
      <S.CellData>
        {cell.data.customForm || <S.DeletedForm disabled={disabled}/>}
      </S.CellData>
    );
  }
  return (
    <S.CellData inflected>
      <InflectedForm pattern={cell.data.text}/>
    </S.CellData>
  );
};

export default CellData;

interface InflectedFormProps {
  pattern: string;
}

const InflectedForm = React.memo((props: InflectedFormProps) => {
  const {pattern} = props;
  const {term, stems} = useContext(StemsContext);

  // FIXME: Render a plain string when TypeScript allows us to.
  return <>{inflectWord(pattern, term, stems)}</>;
});

InflectedForm.displayName = 'InflectedForm';
