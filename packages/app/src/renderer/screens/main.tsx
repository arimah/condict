import {ChangeEvent, useCallback} from 'react';

import {Button} from '@condict/ui';

import {ThemeName, ColorName, AppearanceConfig} from '../../types';

import {ConfigRecipe} from '../types';

import {useConfig} from '../app-contexts';

import * as S from './styles';

const MainScreen = (): JSX.Element => {
  const {config, updateConfig} = useConfig();

  const {appearance} = config;

  const handleChangeTheme = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const nextTheme = e.target.value as ThemeName;
    updateConfig(config => {
      config.appearance.theme = nextTheme;
    });
  }, []);

  return (
    <S.MainScreen>
      <S.Sidebar>
        <p>I am a bar, at the side.</p>
      </S.Sidebar>
      <S.MainContent>
        <S.OptionGroup aria-label='Theme'>
          <p>Theme:</p>
          <S.OptionList>
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
      </S.MainContent>
    </S.MainScreen>
  );
};

export default MainScreen;

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
