import React, {ChangeEvent, KeyboardEvent, PureComponent} from 'react';
import FocusTrap from 'focus-trap-react';
import {Options as FocusTrapOptions} from 'focus-trap';

import {inflectWord} from '@condict/inflect';
import {SROnly} from '@condict/a11y-utils';
import genId from '@condict/gen-id';

import {CellEditorProps} from '../../table-cell';
import {Cell} from '../../value/types';

import Value from '../value';
import StemsContext, {StemsContextValue} from '../stems-context';
import {DataFields, Messages} from '../types';

import * as S from './styles';

export type Props = CellEditorProps<DataFields, Value, Messages>;

type State = {
  trapActive: boolean;
  cell: Cell<DataFields>;
  inflectedForm: string;
};

export default class CellEditor extends PureComponent<Props, State> {
  public static readonly contextType = StemsContext;

  private readonly dialogId = genId();
  private readonly focusTrapOptions: FocusTrapOptions;
  private readonly inputRef = React.createRef<HTMLInputElement>();

  public constructor(props: Readonly<Props>, context: StemsContextValue) {
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

    this.focusTrapOptions = {
      onDeactivate: this.handleDeactivate,
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const dataLength = this.state.cell.data.customForm!.length;
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

  private handleDeactivate = () => {
    this.props.onDone(this.state.cell);
  };

  private handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    const {cell} = this.state;
    this.setState({
      cell: cell.set('data', cell.data.set('customForm', value)),
    }, this.emitInput);
  };

  private handleRevertClick = () => {
    const {cell} = this.state;
    this.setState({
      cell: cell.set('data', cell.data.set('customForm', null)),
    }, () => {
      this.props.onDone(this.state.cell);
    });
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
      this.props.onDone(this.state.cell);
    }
  };

  private emitInput = () => {
    this.props.onInput(this.state.cell);
  };

  public render() {
    const {messages} = this.props;
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
          {this.renderCellPopup()}
        </S.CellEditor>
      </FocusTrap>
    );
  }

  private renderCellInput() {
    const {messages} = this.props;
    const {cell: {data}, inflectedForm} = this.state;

    return (
      <S.CellInput
        value={data.customForm !== null ? data.customForm : inflectedForm}
        aria-label={messages.cellValueLabel()}
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

  private renderCellPopup() {
    const {messages} = this.props;
    const {cell: {data}} = this.state;

    if (data.customForm === null) {
      return (
        <SROnly id={`${this.dialogId}-desc`}>
          {messages.cellDialogInputHelper()}
        </SROnly>
      );
    }

    return (
      <S.CellPopup>
        <S.RevertButton
          slim
          label={messages.useDefaultFormButton()}
          onClick={this.handleRevertClick}
        />
      </S.CellPopup>
    );
  }
}
