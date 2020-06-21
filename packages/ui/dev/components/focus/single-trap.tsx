import React, {useState} from 'react';

import {FocusTrap, Button, Intent} from '../../../src';

import * as S from './styles';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const Demo = () => {
  const [active, setActive] = useState(false);

  return (
    <section>
      <h3>Single <code>FocusTrap</code></h3>
      <p>
        <Button
          slim
          label='Activate focus trap'
          onClick={() => setActive(true)}
        />
      </p>
      <FocusTrap active={active}>
        <S.Scope kind='trap' active={active}>
          <p>
            <Button
              slim
              label='Deactivate trap'
              intent={Intent.SECONDARY}
              onClick={() => setActive(false)}
            />
          </p>
          <p>
            <Button slim label='A generic button' intent={Intent.SECONDARY}/>
          </p>
        </S.Scope>
      </FocusTrap>
    </section>
  );
};

export default Demo;
