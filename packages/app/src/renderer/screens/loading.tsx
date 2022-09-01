import React, {useState} from 'react';
import {Localized} from '@fluent/react';

import {useDelayedMountEffect} from '../hooks';

import * as S from './styles';

const LoadingScreen = React.memo((): JSX.Element => {
  // Show the loading text after a short delay. Usually it takes far less than
  // a second to start the server.
  const [visible, setVisible] = useState(false);
  useDelayedMountEffect(500, () => setVisible(true));
  return (
    <S.LoadingScreen visible={visible}>
      <S.LoadingSpinner size={64}/>
      <S.LoadingText>
        <Localized id='generic-loading'/>
      </S.LoadingText>
    </S.LoadingScreen>
  );
});

LoadingScreen.displayName = 'LoadingScreen';

export default LoadingScreen;
