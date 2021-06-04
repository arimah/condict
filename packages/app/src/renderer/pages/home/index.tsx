import {ChangeEvent, useCallback} from 'react';

import {Button} from '@condict/ui';

import {ThemePreference, ColorName, AppearanceConfig} from '../../../types';

import {Link} from '../../ui';
import {LanguagePage, PartOfSpeechPage} from '../../pages';
import {useConfig, useAvailableLocales} from '../../app-contexts';
import {ConfigRecipe} from '../../types';

// FIXME: Remove when we can GraphQL
import {Languages, PartsOfSpeech} from '../../sample-data';

import * as S from './styles';

const HomePage = (): JSX.Element => {
  const {config, updateConfig} = useConfig();
  const availableLocales = useAvailableLocales();

  const {appearance} = config;

  const handleChangeTheme = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const nextTheme = e.target.value as ThemePreference;
    updateConfig(config => {
      config.appearance.theme = nextTheme;
    });
  }, []);

  const handleChangeLocale = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const nextLocale = e.target.value;
    updateConfig(config => {
      config.locale = nextLocale;
    });
  }, []);

  const lang1 = LanguagePage(Languages[1].id, Languages[1].name);
  const lang2 = LanguagePage(Languages[2].id, Languages[2].name);

  const pos1 = PartOfSpeechPage(PartsOfSpeech[1].id, PartsOfSpeech[1].name, lang1);
  const pos2 = PartOfSpeechPage(PartsOfSpeech[2].id, PartsOfSpeech[2].name, lang1);
  const pos3 = PartOfSpeechPage(PartsOfSpeech[3].id, PartsOfSpeech[3].name, lang2);
  const pos4 = PartOfSpeechPage(PartsOfSpeech[4].id, PartsOfSpeech[4].name, lang2);

  return <>
    <p>This is the content of the home page.</p>
    <p>Some sample links to test navigation:</p>
    <ul>
      <li>
        Language: <Link to={lang1}>{lang1.name}</Link>
        {' – '}
        <Link to={pos1}>{pos1.name}</Link>, <Link to={pos2}>{pos2.name}</Link>
      </li>
      <li>
        Language: <Link to={lang2}>{lang2.name}</Link>
        {' – '}
        <Link to={pos3}>{pos3.name}</Link>, <Link to={pos4}>{pos4.name}</Link>
      </li>
    </ul>
    <hr/>
    <S.OptionGroup aria-label='Theme'>
      <p>Theme:</p>
      <S.OptionList>
        <S.Option
          label='Same as system'
          name='theme'
          value='system'
          checked={appearance.theme === 'system'}
          onChange={handleChangeTheme}
        />
        <S.Option
          label='Light'
          name='theme'
          value='light'
          checked={appearance.theme === 'light'}
          onChange={handleChangeTheme}
        />
        <S.Option
          label='Dark'
          name='theme'
          value='dark'
          checked={appearance.theme === 'dark'}
          onChange={handleChangeTheme}
        />
      </S.OptionList>
    </S.OptionGroup>
    <S.OptionGroup aria-label='Accent colour'>
      <p>Accent colour:</p>
      <ColorOptions
        color='accentColor'
        appearance={appearance}
        updateConfig={updateConfig}
      />
    </S.OptionGroup>
    <S.OptionGroup aria-label='Danger colour'>
      <p>Danger colour:</p>
      <ColorOptions
        color='dangerColor'
        appearance={appearance}
        updateConfig={updateConfig}
      />
    </S.OptionGroup>
    <S.OptionGroup aria-label='Sidebar colour'>
      <p>Sidebar colour:</p>
      <ColorOptions
        color='sidebarColor'
        appearance={appearance}
        updateConfig={updateConfig}
      />
    </S.OptionGroup>
    <p>
      <Button intent='general' label='General button'/>
      {' '}
      <Button intent='accent' label='Accent button'/>
      {' '}
      <Button intent='danger' label='Danger button'/>
    </p>
    <p>
      <Button bold intent='general' label='General button'/>
      {' '}
      <Button bold intent='accent' label='Accent button'/>
      {' '}
      <Button bold intent='danger' label='Danger button'/>
    </p>
    <S.OptionGroup aria-label='Language'>
      <p>Language:</p>
      <S.OptionList>
        {availableLocales.map(locale =>
          <S.Option
            key={locale}
            label={locale}
            name='locale'
            value={locale}
            checked={config.locale === locale}
            onChange={handleChangeLocale}
          />
        )}
      </S.OptionList>
    </S.OptionGroup>
  </>;
};

export default HomePage;

type ColorOptionsProps = {
  color: 'accentColor' | 'dangerColor' | 'sidebarColor';
  appearance: AppearanceConfig;
  updateConfig: (recipe: ConfigRecipe) => void;
};

const ColorOptions = (props: ColorOptionsProps): JSX.Element => {
  const {color, appearance, updateConfig} = props;

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const nextColor = e.target.value as ColorName;
    updateConfig(config => {
      config.appearance[color] = nextColor;
    });
  }, [color]);

  const current = appearance[color];

  return (
    <S.OptionList>
      {Colors.map(([value, label]) =>
        <S.Option
          key={value}
          label={label}
          name={color}
          value={value}
          checked={current === value}
          onChange={handleChange}
        />
      )}
    </S.OptionList>
  );
};

const Colors: readonly (readonly [ColorName, string])[] = [
  ['red', 'Red'],
  ['yellow', 'Yellow'],
  ['green', 'Green'],
  ['blue', 'Blue'],
  ['purple', 'Purple'],
  ['gray', 'Gray'],
];
