import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Map} from 'immutable';
import memoizeOne from 'memoize-one';

import makeTableEditor from '../table-editor';

import Value from './value';
import CellData from './cell-data';
import CellEditor from './cell-editor';
import commands from './commands';
import getCellDescription from './get-cell-description';
import StemsContext from './stems-context';

export {Value as DefinitionTableValue};

const DefinitionTableEditorInner = makeTableEditor({
  Value,
  CellData,
  CellEditor,
  getCellDescription,
  commands,
  canEditStructure: false,
  canSelectMultiple: false,
  canEditCell: cell => !cell.header,
});

export class DefinitionTableEditor extends Component {
  constructor() {
    super();

    this.getStems = memoizeOne(this.getStems);
  }

  getStems(term, stems) {
    return {term, stems};
  }

  render() {
    const {term, stems, ...tableProps} = this.props;
    return (
      <StemsContext.Provider value={this.getStems(term, stems)}>
        <DefinitionTableEditorInner {...tableProps}/>
      </StemsContext.Provider>
    );
  }
}

DefinitionTableEditor.propTypes = {
  ...DefinitionTableEditorInner.propTypes,
  term: PropTypes.string,
  stems: PropTypes.instanceOf(Map),
};

DefinitionTableEditor.defaultProps = {
  ...DefinitionTableEditorInner.defaultProps,
  term: '',
  stems: Map(),
};

DefinitionTableEditor.Commands = DefinitionTableEditorInner.Commands;
