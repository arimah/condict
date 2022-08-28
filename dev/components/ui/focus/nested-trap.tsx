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
        <Button
          slim
          label='Activate outer trap'
          intent='bold'
          onClick={() => setOuter(true)}
        />
      </p>
      <FocusTrap active={outer && inner ? 'paused' : outer}>
        <S.Scope kind='trap' active={outer && inner ? 'paused' : outer}>
          <p>
            <Button
              slim
              label='Deactivate outer trap'
              onClick={() => setOuter(false)}
            />
          </p>
          <p>
            <Button
              slim
              label='Activate inner trap'
              onClick={() => setInner(true)}
            />
          </p>

          <FocusTrap active={inner}>
            <S.Scope kind='trap' active={inner}>
              <p>
                <TextInput defaultValue='A place for greatness'/>
              </p>
              <p>
                <Button
                  slim
                  label='Deactivate inner trap'
                  onClick={() => setInner(false)}
                />
              </p>
            </S.Scope>
          </FocusTrap>

          <p>
            <Button
              slim
              label='A button after the inner trap'
            />
          </p>
        </S.Scope>
      </FocusTrap>
    </section>
  );
};

export default Demo;
