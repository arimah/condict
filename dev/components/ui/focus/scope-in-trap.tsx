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
        <Button slim intent='bold' onClick={() => setTrapActive(true)}>
          Reveal and activate trap
        </Button>
      </p>
      {trapActive &&
        <FocusTrap>
          <S.Scope $kind='trap' $active>
            <p>
              <Button slim onClick={() => setTrapActive(false)}>
                Deactivate trap
              </Button>
            </p>

            {Sections.map(s =>
              <Fragment key={s}>
                <p>
                  <Radio
                    name='focus-in-trap-section'
                    checked={section === s}
                    onChange={e => {
                      if (e.target.checked) {
                        setSection(s);
                      }
                    }}
                  >
                    Section {s}
                  </Radio>
                </p>
                <FocusScope active={section === s}>
                  <S.Scope $kind='scope' $active={section === s}>
                    <Button slim>
                      Do thing #{s}
                    </Button>
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
