import React, {Fragment, useState} from 'react';

import {FocusScope, FocusTrap, Button, Radio} from '@condict/ui';

import * as S from './styles';

const Sections = [1, 2, 3];

const Demo = (): JSX.Element => {
  const [trapActive, setTrapActive] = useState(false);
  const [section, setSection] = useState(0);

  return (
    <section>
      <h3><code>FocusScope</code> inside <code>FocusTrap</code></h3>
      <p>
        <Button
          slim
          label='Reveal and activate trap'
          intent='bold'
          onClick={() => setTrapActive(true)}
        />
      </p>
      {trapActive &&
        <FocusTrap>
          <S.Scope kind='trap' active>
            <p>
              <Button
                slim
                label='Deactivate trap'
                onClick={() => setTrapActive(false)}
              />
            </p>

            {Sections.map(s =>
              <Fragment key={s}>
                <p>
                  <Radio
                    label={`Section ${s}`}
                    name='focus-in-trap-section'
                    checked={section === s}
                    onChange={e => {
                      if (e.target.checked) {
                        setSection(s);
                      }
                    }}
                  />
                </p>
                <FocusScope active={section === s}>
                  <S.Scope kind='scope' active={section === s}>
                    <Button
                      slim
                      label={`Do thing #${s}`}
                    />
                  </S.Scope>
                </FocusScope>
              </Fragment>
            )}
          </S.Scope>
        </FocusTrap>}
    </section>
  );
};

export default Demo;
