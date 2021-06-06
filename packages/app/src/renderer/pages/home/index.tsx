import {ChangeEvent, Fragment, useCallback} from 'react';

import {Button} from '@condict/ui';

import {ThemePreference, ColorName, AppearanceConfig} from '../../../types';

import {Link} from '../../ui';
import {useData} from '../../data';
import {LanguagePage, PartOfSpeechPage} from '../../pages';
import {useConfig, useAvailableLocales} from '../../app-contexts';
import {ConfigRecipe} from '../../types';

import HomeQuery from './query';
import * as S from './styles';

const HomePage = (): JSX.Element => {
  const data = useData(HomeQuery, null);

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

  const languages = data.state === 'data'
    ? data.result.data?.languages
    : undefined;

  return <>
    <p>This is the content of the home page.</p>
    <ul>
      {languages?.map(lang => {
        const langPage = LanguagePage(lang.id, lang.name);
        return (
          <li key={lang.id}>
            Language: <Link to={langPage}>{lang.name}</Link>
            {' - '}
            {lang.partsOfSpeech.map((pos, i) =>
              <Fragment key={pos.id}>
                {i > 0 && ', '}
                <Link to={PartOfSpeechPage(pos.id, pos.name, langPage)}>
                  {pos.name}
                </Link>
              </Fragment>
            )}
          </li>
        );
      })}
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
