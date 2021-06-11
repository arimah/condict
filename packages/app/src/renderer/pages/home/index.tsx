import {ChangeEvent, Fragment, useState, useCallback} from 'react';

import {Button} from '@condict/ui';

import {ThemePreference, ColorName, AppearanceConfig} from '../../../types';

import {Link} from '../../ui';
import {useData} from '../../data';
import {LanguagePage, PartOfSpeechPage} from '../../pages';
import {useConfig, useAvailableLocales} from '../../app-contexts';
import {PanelProps, PanelParams, useOpenPanel} from '../../navigation';
import {ConfigRecipe} from '../../types';

import HomeQuery from './query';
import * as S from './styles';

type TestResponse = 'yes' | 'no' | 'cancel';

const TestPanel = (props: PanelProps<TestResponse>): JSX.Element => {
  const {onResolve} = props;

  const [childResponse, setChildResponse] = useState<TestResponse | null>(null);

  const openPanel = useOpenPanel();

  return <>
    <p>Hello, I am a test panel!</p>
    <p>I contain a small amount of mostly meaningless content, including this long paragraph:</p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
      quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
      cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
      proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p>There are three possible responses:</p>
    <p>
      <Button
        label='Yes'
        intent='accent'
        bold
        onClick={() => onResolve('yes')}
      />
      {' '}
      <Button label='No' onClick={() => onResolve('no')}/>
      {' '}
      <Button
        label='Cancel'
        intent='danger'
        onClick={() => onResolve('cancel')}
      />
    </p>
    <hr/>
    <p>
      {'For the adventurous: '}
      <Button
        label='Open a nested panel'
        slim
        onClick={() => openPanel(TestPanelParams).then(setChildResponse)}
      />
    </p>
    {childResponse && <p>Nested panel response: {childResponse}</p>}
  </>;
};

const TestPanelParams: PanelParams<TestResponse> = {
  initialTitle: 'Testing things',
  // eslint-disable-next-line react/display-name
  render: props => <TestPanel {...props}/>,
};

const HomePage = (): JSX.Element => {
  const data = useData(HomeQuery, null);

  const openPanel = useOpenPanel();

  const [panelResponse, setPanelResponse] = useState<TestResponse | null>(null);

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
    <p>
      <Button
        label='Open a test panel'
        bold
        onClick={() => openPanel(TestPanelParams).then(setPanelResponse)}
      />
    </p>
    {panelResponse && <p>Test panel response: {panelResponse}</p>}
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
