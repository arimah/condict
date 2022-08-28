import {KeyboardEvent, useCallback, useRef, useEffect} from 'react';
import {useLocalization} from '@fluent/react';

import {Shortcut} from '@condict/ui';

import {DialogParams, DialogProps} from '../../dialog-stack';
import {CancelKey} from '../../shortcuts';

import {MessageBoxParams} from './types';
import * as S from './styles';

type Props<R> = DialogProps<R> & MessageBoxParams<R>;

function MessageBox<R>(props: Props<R>): JSX.Element {
  const {
    titleKey,
    message,
    buttons,
    animationPhase,
    onAnimationPhaseEnd,
    onResolve,
  } = props;

  const {l10n} = useLocalization();

  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const cancelButton = buttons.find(b => b.disposition === 'cancel');
    if (Shortcut.matches(CancelKey, e) && cancelButton) {
      e.preventDefault();
      onResolve(cancelButton.value);
    }
  }, [buttons, onResolve]);

  const title = l10n.getString(titleKey);

  return (
    <S.Main
      title={title}
      animationPhase={animationPhase}
      onAnimationPhaseEnd={onAnimationPhaseEnd}
      onKeyDown={handleKeyDown}
    >
      <S.Title>{title}</S.Title>
      <S.Message>{message}</S.Message>
      <S.Buttons>
        {buttons.map((button, i) =>
          <S.Button
            key={i}
            label={l10n.getString(button.labelKey)}
            intent={button.intent}
            onClick={() => onResolve(button.value)}
            ref={button.disposition === 'primary' ? primaryRef : undefined}
          >
            {button.content}
          </S.Button>
        )}
      </S.Buttons>
    </S.Main>
  );
}

export default function messageBox<R>(
  params: MessageBoxParams<R>
): DialogParams<R> {
  return {
    // eslint-disable-next-line react/display-name
    render: props => <MessageBox {...props} {...params}/>,
  };
}
