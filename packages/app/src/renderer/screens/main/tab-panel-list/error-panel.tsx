import React, {Ref, useCallback, useEffect, useRef} from 'react';

import {combineRefs} from '@condict/ui';

import {useUpdateTab} from '../../../navigation';
import {RuntimeError} from '../../../ui';

import * as S from './styles';

export type Props = {
  error: Error;
  onReload: () => void;
};

const ErrorPanel = React.forwardRef((
  props: Props,
  ref: Ref<HTMLDivElement>
): JSX.Element => {
  const {error, onReload} = props;

  const updateTab = useUpdateTab();
  const handleReload = useCallback(() => {
    updateTab({crashed: false});
    onReload();
  }, [onReload]);

  const ownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateTab({crashed: true});
    ownRef.current?.focus();
  }, []);

  return (
    <S.ErrorPage ref={combineRefs(ref, ownRef)}>
      <RuntimeError error={error} onReload={handleReload}/>
    </S.ErrorPage>
  );
});

ErrorPanel.displayName = 'ErrorPanel';

export default ErrorPanel;
