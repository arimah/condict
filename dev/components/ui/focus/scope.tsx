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
          label='First scope active'
          checked={scope1}
          onChange={e => setScope1(e.target.checked)}
        />
      </p>
      <FocusScope active={scope1}>
        <S.Scope kind='scope' active={scope1}>
          <p>
            <Button slim label='I am clickable' intent='secondary'/>
          </p>
          <p>
            <Button slim label='Hello, focus!' intent='secondary'/>
          </p>
        </S.Scope>
      </FocusScope>

      <p>
        <Checkbox
          label='Second scope active'
          checked={scope2}
          onChange={e => setScope2(e.target.checked)}
        />
      </p>
      <FocusScope active={scope2}>
        <S.Scope kind='scope' active={scope2}>
          <p>
            <Button
              slim
              label='I am focusable and tabbable'
              intent='secondary'
            />
          </p>
          <p>
            <Button
              slim
              label='I am focusable but not tabbable'
              intent='secondary'
              tabIndex={-1}
            />
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
