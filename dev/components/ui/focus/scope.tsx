import React, {useState} from 'react';

import {FocusScope, Checkbox, Button, TextInput} from '@condict/ui';

import * as S from './styles';

const Demo = (): JSX.Element => {
  const [scope1, setScope1] = useState(true);
  const [scope2, setScope2] = useState(true);

  return (
    <section>
      <h3><code>FocusScope</code></h3>

      <p>
        <Checkbox
          checked={scope1}
          onChange={e => setScope1(e.target.checked)}
        >
          First scope active
        </Checkbox>
      </p>
      <FocusScope active={scope1}>
        <S.Scope kind='scope' active={scope1}>
          <p>
            <Button slim>I am clickable</Button>
          </p>
          <p>
            <Button slim>Hello, focus!</Button>
          </p>
        </S.Scope>
      </FocusScope>

      <p>
        <Checkbox
          checked={scope2}
          onChange={e => setScope2(e.target.checked)}
        >
          Second scope active
        </Checkbox>
      </p>
      <FocusScope active={scope2}>
        <S.Scope kind='scope' active={scope2}>
          <p>
            <Button slim>
              I am focusable and tabbable
            </Button>
          </p>
          <p>
            <Button slim tabIndex={-1}>
              I am focusable but not tabbable
            </Button>
          </p>
          <p>
            <TextInput defaultValue='Type something here!'/>
          </p>
        </S.Scope>
      </FocusScope>
    </section>
  );
};

export default Demo;
