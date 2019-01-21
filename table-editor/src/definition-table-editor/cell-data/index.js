import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import StemsContext from '../stems-context';
import inflectWord from '../inflect-word';

import * as S from './styles';

const CellData = ({cell, disabled}) => {
  if (cell.header) {
    return <S.CellData>{cell.data.text}</S.CellData>;
  }
  if (cell.data.customForm !== null) {
    return (
      <S.CellData deleted={cell.data.customForm === ''}>
        {cell.data.customForm || <S.DeletedForm disabled={disabled}/>}
      </S.CellData>
    );
  }
  return (
    <S.CellData inflected={true}>
      <InflectedForm pattern={cell.data.text}/>
    </S.CellData>
  );
};

CellData.propTypes = {
  cell: PropTypes.any.isRequired,
  editing: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default CellData;

class InflectedForm extends PureComponent {
  render() {
    const {pattern} = this.props;
    const {term, stems} = this.context;

    return inflectWord(pattern, term, stems);
  }
}

InflectedForm.contextType = StemsContext;

InflectedForm.propTypes = {
  pattern: PropTypes.string,
};
