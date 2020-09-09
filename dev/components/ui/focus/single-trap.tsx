import React, {useState} from 'react';

import {FocusTrap, Button} from '@condict/ui';

import * as S from './styles';

const Demo = (): JSX.Element => {
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
              intent='secondary'
              onClick={() => setActive(false)}
            />
          </p>
          <p>
            <Button
              slim
              label='A generic button'
              intent='secondary'
            />
          </p>
        </S.Scope>
      </FocusTrap>
    </section>
  );
};

export default Demo;
