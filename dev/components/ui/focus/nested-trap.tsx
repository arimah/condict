import React, {useState} from 'react';

import {FocusTrap, Button, TextInput} from '@condict/ui';

import * as S from './styles';

const Demo = (): JSX.Element => {
  const [outer, setOuter] = useState(false);
  const [inner, setInner] = useState(false);

  return (
    <section>
      <h3>Nested <code>FocusTrap</code></h3>
      <p>
        <Button slim intent='bold' onClick={() => setOuter(true)}>
          Activate outer trap
        </Button>
      </p>
      <FocusTrap active={outer && inner ? 'paused' : outer}>
        <S.Scope $kind='trap' $active={outer && inner ? 'paused' : outer}>
          <p>
            <Button slim onClick={() => setOuter(false)}>
              Deactivate outer trap
            </Button>
          </p>
          <p>
            <Button slim onClick={() => setInner(true)}>
              Activate inner trap
            </Button>
          </p>

          <FocusTrap active={inner}>
            <S.Scope $kind='trap' $active={inner}>
              <p>
                <TextInput defaultValue='A place for greatness'/>
              </p>
              <p>
                <Button slim onClick={() => setInner(false)}>
                  Deactivate inner trap
                </Button>
              </p>
            </S.Scope>
          </FocusTrap>

          <p>
            <Button slim>
              A button after the inner trap
            </Button>
          </p>
        </S.Scope>
      </FocusTrap>
    </section>
  );
};

export default Demo;
