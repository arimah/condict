import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';

import {SROnly} from '@condict/a11y-utils';
import genId from '@condict/gen-id';

import StemsContext from '../stems-context';
import inflectWord from '../inflect-word';

import * as S from './styles';

export default class CellEditor extends Component {
  constructor(props, context) {
    super(props, context);

    const {typedValue} = props;
    let {initialCell} = props;
    if (typedValue) {
      initialCell = initialCell.set(
        'data',
        initialCell.data.set('customForm', typedValue)
      );
    }

    const inflectedForm = inflectWord(
      initialCell.data.text,
      context.term,
      context.stems
    );
    this.state = {
      trapActive: false,
      cell: initialCell,
      inflectedForm,
    };

    this.dialogId = genId();
    this.focusTrapOptions = {
      onDeactivate: this.handleDeactivate.bind(this),
      returnFocusOnDeactivate: true,
      clickOutsideDeactivates: true,
      escapeDeactivates: true,
    };
    this.inputRef = React.createRef();

    this.emitInput = this.emitInput.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleRevertClick = this.handleRevertClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    // If we got into the cell editor by typing into the cell, we need to move
    // the selection to the end of the value, so the user can keep typing. The
    // default behaviour is to select the entire text, which obviously means
    // the user would type over the first character.
    const {input} = this.inputRef.current;
    input.focus();
    if (this.props.typedValue) {
      const dataLength = this.state.cell.data.customForm.length;
      input.setSelectionRange(dataLength, dataLength, 'forward');

      // We've modified the cell inside the constructor. Make sure to notify
      // the parent table about it.
      this.emitInput();
    } else {
      input.select();
    }

    this.setState({trapActive: true});
  }

  handleDeactivate() {
    this.props.onDone(this.state.cell);
  }

  handleTextChange(e) {
    const {value} = e.target;
    const {cell} = this.state;
    this.setState({
      cell: cell.set('data', cell.data.set('customForm', value))
    }, this.emitInput);
  }

  handleRevertClick() {
    const {cell} = this.state;
    this.setState({
      cell: cell.set('data', cell.data.set('customForm', null))
    }, () => {
      this.props.onDone(this.state.cell);
    });
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      // Allow Enter to work with buttons.
      if (
        document.activeElement &&
        document.activeElement.tagName === 'BUTTON'
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      this.props.onDone(this.state.cell);
    }
  }

  emitInput() {
    this.props.onInput(this.state.cell);
  }

  render() {
    const {trapActive} = this.state;

    const helperId = `${this.dialogId}-helper`;
    return (
      <FocusTrap
        active={trapActive}
        focusTrapOptions={this.focusTrapOptions}
      >
        <S.CellEditor
          id={this.props.id}
          role='dialog'
          aria-label='Edit cell'
          aria-modal='true'
          aria-describedby={helperId}
          tabIndex={-1}
          onKeyDown={this.handleKeyDown}
        >
          <SROnly id={helperId}>
            Press enter or escape to save and return.
          </SROnly>
          {this.renderCellInput()}
          {this.renderCellPopup()}
        </S.CellEditor>
      </FocusTrap>
    );
  }

  renderCellInput() {
    const {cell: {data}, inflectedForm} = this.state;

    return (
      <S.CellInput
        value={data.customForm !== null ? data.customForm : inflectedForm}
        aria-label='Cell value'
        aria-describedby={
          data.customForm !== null
            ? `${this.dialogId}-desc`
            : undefined
        }
        borderRadius='0'
        inflected={data.customForm === null}
        onChange={this.handleTextChange}
        ref={this.inputRef}
      />
    );
  }

  renderCellPopup() {
    const {cell: {data}} = this.state;

    if (data.customForm === null) {
      return (
        <SROnly id={`${this.dialogId}-desc`}>
          Type here to define a custom form.
        </SROnly>
      );
    }

    return (
      <S.CellPopup>
        <S.RevertButton
          slim
          label='Revert to default form'
          onClick={this.handleRevertClick}
        />
      </S.CellPopup>
    );
  }
}

CellEditor.contextType = StemsContext;

CellEditor.propTypes = {
  id: PropTypes.string.isRequired,
  initialCell: PropTypes.object.isRequired,
  typedValue: PropTypes.string,
  tableValue: PropTypes.object.isRequired,
  onDone: PropTypes.func.isRequired,
  onInput: PropTypes.func.isRequired,
};

CellEditor.defaultProps = {
  typedValue: null,
};
