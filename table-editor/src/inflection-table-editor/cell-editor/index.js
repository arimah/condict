import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';

import {Checkbox} from '@condict/admin-ui';
import {SROnly} from '@condict/a11y-utils';
import genId from '@condict/gen-id';

import {DoNotDeriveLemmaIcon, CustomDisplayNameIcon} from '../../icons';

import getDerivedDisplayName from '../get-derived-name';

import * as S from './styles';

export default class CellEditor extends PureComponent {
  constructor(props) {
    super(props);

    const {typedValue, tableValue} = props;
    let {initialCell} = props;
    if (typedValue) {
      initialCell = initialCell.set(
        'data',
        initialCell.data.set('text', typedValue)
      );
    }
    const derivedDisplayName = getDerivedDisplayName(
      tableValue,
      initialCell.key
    );

    this.state = {
      trapActive: false,
      inputFocused: false,
      cell: initialCell,
      displayName: initialCell.data.hasCustomDisplayName
        ? initialCell.data.displayName
        : derivedDisplayName,
      derivedDisplayName,
    };

    this.dialogId = genId();
    this.displayNameDescId = genId();
    this.focusTrapOptions = {
      onDeactivate: this.handleDeactivate.bind(this),
      returnFocusOnDeactivate: true,
      clickOutsideDeactivates: true,
      escapeDeactivates: true,
    };
    this.inputRef = React.createRef();
    this.displayNameRef = React.createRef();

    this.emitInput = this.emitInput.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleHeaderChange = this.handleHeaderChange.bind(this);
    this.handleDeriveLemmaChange = this.handleDeriveLemmaChange.bind(this);
    this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this);
    this.handleDeriveDisplayNameClick = this.handleDeriveDisplayNameClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    // If we got into the cell editor by typing into the cell, we need to move
    // the selection to the end of the value, so the user can keep typing. The
    // default behaviour is to select the entire text, which obviously means
    // the user would type over the first character.
    const input = this.inputRef.current;
    input.focus();
    if (this.props.typedValue) {
      const dataLength = this.state.cell.data.text.length;
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

  handleInputFocus() {
    this.setState({inputFocused: true});
  }

  handleInputBlur() {
    this.setState({inputFocused: false});
  }

  handleTextChange(e) {
    const {value} = e.target;
    const {cell} = this.state;
    this.setState({
      cell: cell.set('data', cell.data.set('text', value)),
    }, this.emitInput);
  }

  handleHeaderChange(e) {
    const header = e.target.checked;
    const {cell} = this.state;
    this.setState({cell: cell.set('header', header)}, this.emitInput);
  }

  handleDeriveLemmaChange(e) {
    const deriveLemma = e.target.checked;
    const {cell} = this.state;
    this.setState({
      cell: cell.set('data', cell.data.set('deriveLemma', deriveLemma)),
    }, this.emitInput);
  }

  handleDisplayNameChange(e) {
    const {value} = e.target;
    const {cell} = this.state;
    this.setState({
      cell: cell.set('data',
        cell.data
          .set('hasCustomDisplayName', true)
          .set('displayName', value)
      ),
      displayName: value,
    }, this.emitInput);
  }

  handleDeriveDisplayNameClick() {
    const {cell, derivedDisplayName} = this.state;
    this.setState({
      cell: cell.set('data',
        cell.data
          .set('hasCustomDisplayName', false)
          .set('displayName', derivedDisplayName)
      ),
      displayName: derivedDisplayName,
    }, this.emitInput);
    this.displayNameRef.current.focus();
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

    const helperId = `${this.dialogId}-desc`;
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
          <S.CellPopup>
            {this.renderHeaderToggle()}
            {this.renderDeriveLemmaToggle()}
            {this.renderDisplayNameInput()}
          </S.CellPopup>
        </S.CellEditor>
      </FocusTrap>
    );
  }

  renderCellInput() {
    const {inputFocused, cell} = this.state;
    const {data} = cell;

    const needIcons = !cell.header && (
      !data.deriveLemma ||
      data.hasCustomDisplayName
    );
    return (
      <S.CellInputWrapper focus={inputFocused}>
        <S.CellInput
          minimal
          value={data.text}
          aria-label='Cell value'
          borderRadius='0'
          onChange={this.handleTextChange}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          inputRef={this.inputRef}
        />
        {needIcons &&
          <S.CellIcons>
            {!data.deriveLemma && <DoNotDeriveLemmaIcon/>}
            {data.hasCustomDisplayName && <CustomDisplayNameIcon/>}
          </S.CellIcons>
        }
      </S.CellInputWrapper>
    );
  }

  renderHeaderToggle() {
    const {cell} = this.state;

    return (
      <S.CellSettingsGroup>
        <Checkbox
          checked={cell.header}
          label='Header cell'
          onChange={this.handleHeaderChange}
        />
      </S.CellSettingsGroup>
    );
  }

  renderDeriveLemmaToggle() {
    const {cell} = this.state;
    if (cell.header) {
      return null;
    }

    return (
      <S.CellSettingsGroup>
        <Checkbox
          checked={cell.data.deriveLemma}
          label='Add form to dictionary'
          onChange={this.handleDeriveLemmaChange}
        />
      </S.CellSettingsGroup>
    );
  }

  renderDisplayNameInput() {
    const {cell, displayName} = this.state;
    if (cell.header) {
      return null;
    }

    const {data} = cell;
    return <>
      <S.CellSettingsSeparator/>
      <S.CellSettingsGroup>
        <S.DisplayNameLabel>
          Name of this form:
          <S.DisplayNameInput
            minimal
            value={displayName}
            aria-describedby={
              data.hasCustomDisplayName
                ? undefined
                : this.displayNameDescId
            }
            onChange={this.handleDisplayNameChange}
            inputRef={this.displayNameRef}
          />
        </S.DisplayNameLabel>
        {data.hasCustomDisplayName ? (
          <S.DeriveDisplayNameButton
            slim
            label='Use automatic name'
            onClick={this.handleDeriveDisplayNameClick}
          />
        ) : (
          <S.DisplayNameDesc id={this.displayNameDescId}>
            The name is calculated automatically. Type here to change it.
          </S.DisplayNameDesc>
        )}
      </S.CellSettingsGroup>
    </>;
  }
}

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
