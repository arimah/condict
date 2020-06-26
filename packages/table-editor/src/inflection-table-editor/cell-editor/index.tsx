import React, {ChangeEvent, PureComponent} from 'react';
import produce from 'immer';

import {FocusTrap} from '@condict/ui';
import {normalizePattern} from '@condict/inflect';
import {SROnly} from '@condict/a11y-utils';
import genId from '@condict/gen-id';

import CellDialog from '../../cell-dialog';
import {CellWithData, CellEditorProps} from '../../types';

import {getDerivedName} from '../operations';
import {InflectionTableData, Messages} from '../types';

import CellInput from './cell-input';
import SettingToggle from './setting-toggle';
import DisplayNameInput from './display-name-input';
import * as S from './styles';

export type Props = CellEditorProps<InflectionTableData, Messages>;

// The cell editor stores a copy of the current display name, rather than
// always getting it from the cell. If we didn't do this, we would have to
// set the cell's display name whenever the editor opens, unless the cell
// has a custom name already. This would cause unnecessary cell updates,
// polluting undo stacks and the like.

type State = {
  value: CellWithData<InflectionTableData>;
  displayName: string;
  derivedDisplayName: string;
  trapActive: boolean;
};

export default class CellEditor extends PureComponent<Props, State> {
  private readonly dialogId = genId();
  private readonly displayNameDescId = genId();
  private readonly inputRef = React.createRef<HTMLInputElement>();
  private readonly displayNameRef = React.createRef<HTMLInputElement>();

  public constructor(props: Readonly<Props>) {
    super(props);

    const {table, typedValue} = props;

    // Since display names are hidden normally, we don't bother recomputing
    // them for all cells when the table structure changes. Instead, it's
    // computed on demand when you start editing a cell and when the table
    // is exported.
    const derivedDisplayName = getDerivedName(
      table,
      props.initial.cell.key
    );

    const value = produce(props.initial, value => {
      if (typedValue) {
        value.data.text = typedValue;
      }
    });

    this.state = {
      value,
      derivedDisplayName,
      displayName: value.data.hasCustomDisplayName
        ? value.data.displayName
        : derivedDisplayName,
      trapActive: false,
    };
  }

  public componentDidMount(): void {
    // If we got into the cell editor by typing into the cell, we need to move
    // the selection to the end of the value, so the user can keep typing. The
    // default behaviour is to select the entire text, which obviously means
    // the user would type over the first character.
    const input = this.inputRef.current;

    if (input) {
      input.focus();
      if (this.props.typedValue) {
        const dataLength = this.state.value.data.text.length;
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
    this.props.onCommit(
      produce(this.state.value, value => {
        value.data.text = normalizePattern(value.data.text);
      })
    );
  };

  private handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    this.setState({
      value: produce(this.state.value, value => {
        value.data.text = text;
      }),
    }, this.emitInput);
  };

  private handleHeaderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const header = e.target.checked;
    this.setState({
      value: produce(this.state.value, value => {
        value.cell.header = header;
      }),
    }, this.emitInput);
  };

  private handleDeriveLemmaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const deriveLemma = e.target.checked;
    this.setState({
      value: produce(this.state.value, value => {
        value.data.deriveLemma = deriveLemma;
      }),
    }, this.emitInput);
  };

  private handleDisplayNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const displayName = e.target.value;
    this.setState({
      value: produce(this.state.value, value => {
        value.data.hasCustomDisplayName = true;
        value.data.displayName = displayName;
      }),
      displayName,
    }, this.emitInput);
  };

  private handleDeriveDisplayNameClick = () => {
    const {value, derivedDisplayName} = this.state;
    this.setState({
      value: produce(value, value => {
        value.data.hasCustomDisplayName = false;
        value.data.displayName = derivedDisplayName;
      }),
      displayName: derivedDisplayName,
    }, this.emitInput);

    if (this.displayNameRef.current) {
      this.displayNameRef.current.focus();
    }
  };

  private emitInput = () => {
    this.props.onInput(this.state.value);
  };

  public render(): JSX.Element {
    const {messages} = this.props;
    const {value, displayName, trapActive} = this.state;

    const helperId = `${this.dialogId}-desc`;
    return (
      <FocusTrap
        active={trapActive}
        onPointerDownOutside={this.commit}
      >
        <CellDialog
          id={this.props.id}
          aria-label={messages.cellEditorTitle()}
          aria-describedby={helperId}
          onRequestClose={this.commit}
        >
          <SROnly id={helperId}>
            {messages.cellEditorSRHelper()}
          </SROnly>
          <CellInput
            value={value}
            messages={messages}
            onChange={this.handleTextChange}
            ref={this.inputRef}
          />
          <S.CellPopup>
            <SettingToggle
              checked={value.cell.header}
              label={messages.headerCellOption()}
              onChange={this.handleHeaderChange}
            />
            {!value.cell.header && <>
              <SettingToggle
                checked={value.data.deriveLemma}
                label={messages.deriveLemmaOption()}
                onChange={this.handleDeriveLemmaChange}
              />
              <S.CellSettingsSeparator/>
              <DisplayNameInput
                value={displayName}
                hasCustomName={value.data.hasCustomDisplayName}
                messages={messages}
                onChange={this.handleDisplayNameChange}
                onDeriveName={this.handleDeriveDisplayNameClick}
                ref={this.displayNameRef}
              />
            </>}
          </S.CellPopup>
        </CellDialog>
      </FocusTrap>
    );
  }
}
