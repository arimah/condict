import {useEffect, useRef} from 'react';

import {RuntimeError} from '../ui';

import * as S from './styles';

export type Props = {
  error: Error;
  isGlobalError?: boolean;
  onReload: () => void;
};

const ErrorScreen = (props: Props): JSX.Element => {
  const screenRef = useRef<HTMLElement>(null);
  useEffect(() => {
    screenRef.current?.focus();
  }, []);

  return (
    <S.ErrorScreen ref={screenRef}>
      <RuntimeError {...props}/>
    </S.ErrorScreen>
  );
};

export default ErrorScreen;
