import React, {useState} from 'react';

import {FocusTrap, Button, TextInput} from '@condict/ui';

import * as S from './styles';

const Demo = (): JSX.Element => {
  const [active, setActive] = useState(false);

  return (
    <section>
      <h3><code>FocusTrap</code> with click outside detection</h3>
      <p>
        <Button slim intent='bold' onClick={() => setActive(true)}>
          Activate focus trap
        </Button>
      </p>
      <FocusTrap
        active={active}
        onPointerDownOutside={() => setActive(false)}
      >
        <S.Scope $kind='trap' $active={active}>
          <p>
            <Button slim onClick={() => setActive(false)}>
              Deactivate trap
            </Button>
          </p>
          <p>
            <TextInput defaultValue='You can safely click (and tab) here'/>
          </p>
        </S.Scope>
      </FocusTrap>
      <p>
        <Button slim>
          A button after the trap
        </Button>
      </p>
    </section>
  );
};

export default Demo;
