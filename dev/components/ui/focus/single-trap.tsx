import React, {useState} from 'react';

import {FocusTrap, Button} from '@condict/ui';

import * as S from './styles';

const Demo = (): JSX.Element => {
  const [active, setActive] = useState(false);

  return (
    <section>
      <h3>Single <code>FocusTrap</code></h3>
      <p>
        <Button slim intent='bold' onClick={() => setActive(true)}>
          Activate focus trap
        </Button>
      </p>
      <FocusTrap active={active}>
        <S.Scope kind='trap' active={active}>
          <p>
            <Button slim onClick={() => setActive(false)}>
              Deactivate trap
            </Button>
          </p>
          <p>
            <Button slim>
              A generic button
            </Button>
          </p>
        </S.Scope>
      </FocusTrap>
    </section>
  );
};

export default Demo;
