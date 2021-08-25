import React, {ChangeEvent, PureComponent} from 'react';
import produce from 'immer';

import {FocusTrap, SROnly, genUniqueId} from '@condict/ui';
import {inflectWord} from '@condict/inflect';

import CellDialog from '../../cell-dialog';
import {CellWithData, CellEditorProps} from '../../types';

import CellInput from './cell-input';
import StemsContext from '../stems-context';
import {DefinitionTableData, StemsContextValue, Messages} from '../types';

import * as S from './styles';

export type Props = CellEditorProps<DefinitionTableData, Messages>;

type State = {
  value: CellWithData<DefinitionTableData>;
  /** The pre-calculated default inflected form. */
  defaultForm: string;
  trapActive: boolean;
};

export default class CellEditor extends PureComponent<Props, State> {
  public static readonly contextType = StemsContext;

  private readonly dialogId = genUniqueId();
  private readonly inputRef = React.createRef<HTMLInputElement>();

  public constructor(props: Readonly<Props>, context: StemsContextValue) {
    super(props, context);

    const {typedValue} = props;

    const value = produce(props.initial, value => {
      if (typedValue) {
        value.data.customForm = typedValue;
      }
    });

    const defaultForm = inflectWord(
      value.data.text,
      context.term,
      context.stems
    );
    this.state = {
      value,
      defaultForm,
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const dataLength = this.state.value.data.customForm!.length;
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
    this.setState({trapActive: false}, () => {
      this.props.onCommit(this.state.value);
    });
  };

  private handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const customForm = e.target.value;
    this.setState({
      value: produce(this.state.value, value => {
        value.data.customForm = customForm;
      }),
    }, this.emitInput);
  };

  private handleRevertClick = () => {
    this.setState({
      value: produce(this.state.value, value => {
        value.data.customForm = null;
      }),
    }, this.commit);
  };

  private emitInput = () => {
    this.props.onInput(this.state.value);
  };

  public render(): JSX.Element {
    const {messages} = this.props;
    const {value, defaultForm, trapActive} = this.state;

    const helperId = `${this.dialogId}-helper`;
    const descId = value.data.customForm !== null
      ? `${this.dialogId}-desc`
      : undefined;
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
            data={value.data}
            defaultForm={defaultForm}
            messages={messages}
            aria-describedby={descId}
            onChange={this.handleTextChange}
            ref={this.inputRef}
          />
          {descId &&
            <SROnly id={descId}>
              {messages.cellDialogInputHelper()}
            </SROnly>}
          {value.data.customForm !== null &&
            <S.CellPopup cell={this.inputRef}>
              <S.RevertButton
                label={messages.useDefaultFormButton()}
                onClick={this.handleRevertClick}
              />
            </S.CellPopup>}
        </CellDialog>
      </FocusTrap>
    );
  }
}
