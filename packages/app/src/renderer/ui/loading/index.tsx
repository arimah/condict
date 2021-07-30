import {ReactNode, useState} from 'react';
import {Localized} from '@fluent/react';

import {Spinner} from '@condict/ui';

import {useDelayedMountEffect} from '../../hooks';

import * as S from './styles';

export type Props = {
  delay?: number;
  small?: boolean;
  className?: string;
  children?: ReactNode;
};

const Loading = (props: Props): JSX.Element => {
  const {delay, small, className, children} = props;
  return delay ? (
    <DelayedLoading delay={delay} small={small} className={className}>
      {children}
    </DelayedLoading>
  ) : (
    <ImmediateLoading small={small} className={className}>
      {children}
    </ImmediateLoading>
  );
};

export default Loading;

type DelayedLoadingProps = ImmediateLoadingProps & {
  delay: number;
};

const DelayedLoading = (props: DelayedLoadingProps): JSX.Element | null => {
  const {delay, small, className, children} = props;

  const [show, setShow] = useState(false);
  useDelayedMountEffect(delay, () => setShow(true));

  if (!show) {
    // Not yet.
    return null;
  }

  return (
    <ImmediateLoading small={small} className={className}>
      {children}
    </ImmediateLoading>
  );
};

type ImmediateLoadingProps = {
  small?: boolean;
  className?: string;
  children?: ReactNode;
};

const ImmediateLoading = (props: ImmediateLoadingProps): JSX.Element => {
  const {small, className, children} = props;

  return (
    <S.Main className={className}>
      <Spinner size={small ? 20 : 24}/>
      <S.Content small={small}>
        {children ?? <Localized id='generic-loading'/>}
      </S.Content>
    </S.Main>
  );
};
