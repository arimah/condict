import React, {useState} from 'react';

import {FocusScope, Checkbox, Button, TextInput, Intent} from '../../../src';

import * as S from './styles';

const Demo = () => {
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
            <Button slim label='I am clickable' intent={Intent.SECONDARY}/>
          </p>
          <p>
            <Button slim label='Hello, focus!' intent={Intent.SECONDARY}/>
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
              intent={Intent.SECONDARY}
            />
          </p>
          <p>
            <Button
              slim
              label='I am focusable but not tabbable'
              intent={Intent.SECONDARY}
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
