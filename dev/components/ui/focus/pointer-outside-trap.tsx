import React, {useState} from 'react';

import {FocusTrap, Button, TextInput} from '@condict/ui';

import * as S from './styles';

const Demo = (): JSX.Element => {
  const [active, setActive] = useState(false);

  return (
    <section>
      <h3><code>FocusTrap</code> with click outside detection</h3>
      <p>
        <Button
          slim
          label='Activate focus trap'
          intent='bold'
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
        />
      </p>
    </section>
  );
};

export default Demo;
