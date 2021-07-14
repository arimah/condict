import {ReactChild, useState} from 'react';
import {Localized} from '@fluent/react';

import {Spinner} from '@condict/ui';

import {useDelayedMountEffect} from '../../hooks';

import * as S from './styles';

export type Props = {
  delay?: number;
  className?: string;
  children?: ReactChild;
};

const Loading = (props: Props): JSX.Element => {
  const {delay, className, children} = props;
  return delay ? (
    <DelayedLoading delay={delay} className={className}>
      {children}
    </DelayedLoading>
  ) : (
    <ImmediateLoading className={className}>
      {children}
    </ImmediateLoading>
  );
};

export default Loading;

type DelayedLoadingProps = ImmediateLoadingProps & {
  delay: number;
};

const DelayedLoading = (props: DelayedLoadingProps): JSX.Element | null => {
  const {delay, className, children} = props;

  const [show, setShow] = useState(false);
  useDelayedMountEffect(delay, () => setShow(true));

  if (!show) {
    // Not yet.
    return null;
  }

  return <ImmediateLoading className={className}>{children}</ImmediateLoading>;
};

type ImmediateLoadingProps = {
  className?: string;
  children?: ReactChild;
};

const ImmediateLoading = (props: ImmediateLoadingProps): JSX.Element => {
  const {className, children} = props;

  return (
    <S.Main className={className}>
      <Spinner/>
      <S.Content>
        {children ?? <Localized id='generic-loading'/>}
      </S.Content>
    </S.Main>
  );
};
