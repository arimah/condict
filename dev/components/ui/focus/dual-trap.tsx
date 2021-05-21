import React, {useState} from 'react';

import {
  FocusTrap,
  Button,
  Checkbox,
  TextInput,
  Menu,
  MenuTrigger,
} from '@condict/ui';

import * as S from './styles';

const Demo = (): JSX.Element => {
  const [active, setActive] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <section>
      <h3>Dual <code>FocusTrap</code></h3>
      <p>
        <Button
          slim
          label='Activate both focus traps'
          intent='accent'
          onClick={() => setActive(true)}
        />
      </p>
      <FocusTrap active={active}>
        <S.Scope kind='trap' active={active}>
          <p>
            <Button
              slim
              label='Deactivate both traps'
              onClick={() => setActive(false)}
            />
          </p>
          <p>
            <Checkbox
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
            >
              You can <del>count</del> check on me
            </Checkbox>
          </p>
          <p>
            <MenuTrigger
              menu={
                <Menu>
                  <Menu.Item label='Sample menu'/>
                  <Menu.CheckItem label='Focus manager override' checked/>
                </Menu>
              }
            >
              <Button
                slim
                label='Menu button in first trap'
              />
            </MenuTrigger>
          </p>
        </S.Scope>
      </FocusTrap>

      <p>
        <Button
          slim
          label='Activate both traps (#2)'
          intent='accent'
          onClick={() => setActive(true)}
        />
      </p>

      <FocusTrap active={active}>
        <S.Scope kind='trap' active={active}>
          <p>
            <TextInput defaultValue='This is a haiku (it is not)'/>
          </p>
          <p>
            <Button
              slim
              label='Button in second trap'
            />
          </p>
        </S.Scope>
      </FocusTrap>
    </section>
  );
};

export default Demo;
