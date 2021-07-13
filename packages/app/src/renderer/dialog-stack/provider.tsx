import {ReactNode, useReducer, useMemo, useRef} from 'react';
import {customAlphabet} from 'nanoid';
import produce from 'immer';

import {OpenDialogContext} from './context';
import DialogStack from './stack';
import {Dialog, DialogParams, OpenDialogFn} from './types';

export type Props = {
  children?: ReactNode;
};

type State = {
  readonly dialogs: readonly Dialog[];
};

type Message =
  | {
    type: 'open';
    dialog: Dialog;
    index: number;
    reject: (reason: any) => void;
  }
  | {type: 'close'; index: number; resolve: () => void};

const InitialState: State = {
  dialogs: [],
};

const genId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

const DialogStackProvider = (props: Props): JSX.Element => {
  const {children} = props;

  const [state, dispatch] = useReducer(reduce, InitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const openFirstDialog = useMemo<OpenDialogFn>(() => {
    const openDialog = function<R>(index: number, params: DialogParams<R>) {
      const state = stateRef.current;

      if (state.dialogs.length > index) {
        const owner = state.dialogs[index - 1];
        return Promise.reject(new Error(
          index === 0
            ? `There is already an open root dialog`
            : `Dialog ${owner.id} (#${index - 1}) already has an open dialog`
        ));
      }

      const openNestedDialog: OpenDialogFn = params =>
        openDialog(index + 1, params);

      return new Promise<R>((resolve, reject) => {
        const {render, pointerDownOutside} = params;
        const onResolve = (value: R): void => dispatch({
          type: 'close',
          index,
          resolve: () => resolve(value),
        });

        dispatch({
          type: 'open',
          dialog: {
            id: genId(),
            backdrop: params.backdrop ?? false,
            onPointerDownOutside:
              pointerDownOutside
                ? () => onResolve(pointerDownOutside.value)
                : undefined,
            // eslint-disable-next-line react/display-name
            render: partialProps =>
              <OpenDialogContext.Provider value={openNestedDialog}>
                {render({...partialProps, onResolve})}
              </OpenDialogContext.Provider>,
          },
          index,
          reject,
        });
      });
    };

    return params => openDialog(0, params);
  }, []);

  return (
    <OpenDialogContext.Provider value={openFirstDialog}>
      {children}
      <DialogStack dialogs={state.dialogs}/>
    </OpenDialogContext.Provider>
  );
};

export default DialogStackProvider;

const reduce = produce<State, [Message]>((state, message): State => {
  switch (message.type) {
    case 'open': {
      const {dialog, index, reject} = message;
      if (state.dialogs.length === index) {
        state.dialogs.push(dialog);
      } else {
        reject(new Error('Dialog could not be opened'));
      }
      break;
    }
    case 'close': {
      const {index, resolve} = message;
      // We can only close the most recently opened dialog
      if (index === state.dialogs.length - 1) {
        state.dialogs.pop();
        resolve();
      }
      break;
    }
  }
  return state;
});
