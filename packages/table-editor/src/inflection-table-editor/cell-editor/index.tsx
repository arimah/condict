import React, {ChangeEvent, KeyboardEvent, PureComponent} from 'react';
import FocusTrap from 'focus-trap-react';
import {Options as FocusTrapOptions} from 'focus-trap';

import {Checkbox} from '@condict/ui';
import {normalizePattern} from '@condict/inflect';
import {SROnly} from '@condict/a11y-utils';
import genId from '@condict/gen-id';

import {DoNotDeriveLemmaIcon, CustomDisplayNameIcon} from '../../icons';
import {CellEditorProps} from '../../table-cell';
import Value from '../value';
import {Cell} from '../../value/types';

import getDerivedDisplayName from '../get-derived-name';
import {DataFields, Messages} from '../types';

import * as S from './styles';

export type Props = CellEditorProps<DataFields, Value, Messages>;

type State = {
  trapActive: boolean;
  inputFocused: boolean;
  cell: Cell<DataFields>;
  displayName: string;
  derivedDisplayName: string;
};

export default class CellEditor extends PureComponent<Props, State> {
  private readonly dialogId = genId();
  private readonly displayNameDescId = genId();
  private readonly focusTrapOptions: FocusTrapOptions;
  private readonly inputRef = React.createRef<HTMLInputElement>();
  private readonly displayNameRef = React.createRef<HTMLInputElement>();

  public constructor(props: Readonly<Props>) {
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

    this.focusTrapOptions = {
      onDeactivate: this.commit,
      returnFocusOnDeactivate: true,
      clickOutsideDeactivates: true,
      escapeDeactivates: true,
    };
  }

  public componentDidMount() {
    // If we got into the cell editor by typing into the cell, we need to move
    // the selection to the end of the value, so the user can keep typing. The
    // default behaviour is to select the entire text, which obviously means
    // the user would type over the first character.
    const input = this.inputRef.current;

    if (input) {
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
    }

    this.setState({trapActive: true});
  }

  private commit = () => {
    const {cell} = this.state;
    this.props.onDone(
      cell.update('data', data =>
        data.set('text', normalizePattern(data.text))
      )
    );
  };

  private handleInputFocus = () => {
    this.setState({inputFocused: true});
  };

  private handleInputBlur = () => {
    this.setState({inputFocused: false});
  };

  private handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    const {cell} = this.state;
    this.setState({
      cell: cell.set('data', cell.data.set('text', value)),
    }, this.emitInput);
  };

  private handleHeaderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const header = e.target.checked;
    const {cell} = this.state;
    this.setState({cell: cell.set('header', header)}, this.emitInput);
  };

  private handleDeriveLemmaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const deriveLemma = e.target.checked;
    const {cell} = this.state;
    this.setState({
      cell: cell.set('data', cell.data.set('deriveLemma', deriveLemma)),
    }, this.emitInput);
  };

  private handleDisplayNameChange = (e: ChangeEvent<HTMLInputElement>) => {
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
  };

  private handleDeriveDisplayNameClick = () => {
    const {cell, derivedDisplayName} = this.state;
    this.setState({
      cell: cell.set('data',
        cell.data
          .set('hasCustomDisplayName', false)
          .set('displayName', derivedDisplayName)
      ),
      displayName: derivedDisplayName,
    }, this.emitInput);

    if (this.displayNameRef.current) {
      this.displayNameRef.current.focus();
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
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
      this.commit();
    }
  };

  private emitInput = () => {
    this.props.onInput(this.state.cell);
  };

  public render() {
    const {messages} = this.props;
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
          aria-label={messages.cellEditorTitle()}
          aria-modal='true'
          aria-describedby={helperId}
          tabIndex={-1}
          onKeyDown={this.handleKeyDown}
        >
          <SROnly id={helperId}>
            {messages.cellEditorSRHelper()}
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

  private renderCellInput() {
    const {messages} = this.props;
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
          aria-label={messages.cellValueLabel()}
          borderRadius='0'
          onChange={this.handleTextChange}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          ref={this.inputRef}
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

  private renderHeaderToggle() {
    const {messages} = this.props;
    const {cell} = this.state;

    return (
      <S.CellSettingsGroup>
        <Checkbox
          checked={cell.header}
          label={messages.headerCellOption()}
          onChange={this.handleHeaderChange}
        />
      </S.CellSettingsGroup>
    );
  }

  private renderDeriveLemmaToggle() {
    const {messages} = this.props;
    const {cell} = this.state;
    if (cell.header) {
      return null;
    }

    return (
      <S.CellSettingsGroup>
        <Checkbox
          checked={cell.data.deriveLemma}
          label={messages.deriveLemmaOption()}
          onChange={this.handleDeriveLemmaChange}
        />
      </S.CellSettingsGroup>
    );
  }

  private renderDisplayNameInput() {
    const {messages} = this.props;
    const {cell, displayName} = this.state;
    if (cell.header) {
      return null;
    }

    const {data} = cell;
    return <>
      <S.CellSettingsSeparator/>
      <S.CellSettingsGroup>
        <S.DisplayNameLabel>
          {messages.formNameLabel()}
          <S.DisplayNameInput
            minimal
            value={displayName}
            aria-describedby={
              data.hasCustomDisplayName
                ? undefined
                : this.displayNameDescId
            }
            onChange={this.handleDisplayNameChange}
            ref={this.displayNameRef}
          />
        </S.DisplayNameLabel>
        {data.hasCustomDisplayName ? (
          <S.DeriveDisplayNameButton
            label={messages.useAutomaticNameButton()}
            onClick={this.handleDeriveDisplayNameClick}
          />
        ) : (
          <S.DisplayNameDesc id={this.displayNameDescId}>
            {messages.automaticNameHelper()}
          </S.DisplayNameDesc>
        )}
      </S.CellSettingsGroup>
    </>;
  }
}
