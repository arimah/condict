import React, {useState} from 'react';

import {FocusTrap, Button, TextInput, Intent} from '../../../src';

import * as S from './styles';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const Demo = () => {
  const [active, setActive] = useState(false);

  return (
    <section>
      <h3><code>FocusTrap</code> with click outside detection</h3>
      <p>
        <Button
          slim
          label='Activate focus trap'
          onClick={() => setActive(true)}
        />
      </p>
      <FocusTrap
        active={active}
        onPointerDownOutside={() => setActive(false)}
      >
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
            <TextInput defaultValue='You can safely click (and tab) here'/>
          </p>
        </S.Scope>
      </FocusTrap>
      <p>
        <Button
          slim
          label='A button after the trap'
          intent={Intent.SECONDARY}
        />
      </p>
    </section>
  );
};

export default Demo;
