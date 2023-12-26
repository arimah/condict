import React, {ChangeEvent, useCallback, useImperativeHandle} from 'react';
import {Localized} from '@fluent/react';
import LanguageIcon from 'mdi-react/TranslateIcon';

import {Radio, useUniqueId} from '@condict/ui';

import {useConfig, useAvailableLocales} from '../../app-contexts';

import {Section, SectionComponent} from './types';
import * as S from './styles';

// FIXME: Change to a more appropriate link once Condict has a website
const HelpTranslateUrl = 'https://github.com/arimah/condict';

const Content: SectionComponent = React.forwardRef((_props, ref) => {
  useImperativeHandle(ref, () => ({
    canLeave: true,
  }), []);

  const {config, updateConfig} = useConfig();
  const availableLocales = useAvailableLocales();

  const id = useUniqueId();

  const handleChangeLocale = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const nextLocale = e.target.value;
    updateConfig(config => {
      config.locale = nextLocale;
    });
  }, [updateConfig]);

  return <>
    <Localized
      id='settings-help-translate'
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      elems={{'help-link': <a href={HelpTranslateUrl}/>}}
    >
      <S.IntroText/>
    </Localized>

    <S.OptionList>
      {availableLocales.map(({key, name}) =>
        <Radio
          key={key}
          name={`${id}-locale`}
          value={key}
          checked={key === config.locale}
          onChange={handleChangeLocale}
        >
          {name}
        </Radio>
      )}
    </S.OptionList>
  </>;
});

Content.displayName = 'LanguageSection';

const LanguageSection: Section = {
  key: 'language',
  icon: <LanguageIcon/>,
  content: Content,
};

export default LanguageSection;
