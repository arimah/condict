import React, {
  Fragment,
  ChangeEvent,
  useCallback,
  useImperativeHandle,
} from 'react';
import {Localized} from '@fluent/react';
import AppearanceIcon from 'mdi-react/PaletteIcon';

import {Radio, MotionPreference, useUniqueId} from '@condict/ui';

import {ColorName, ThemePreference} from '../../../types';

import {useConfig} from '../../app-contexts';

import ColorOptions from './color-options';
import ZoomSlider from './zoom-slider';
import {Section, SectionComponent} from './types';
import * as S from './styles';

const ThemeOptions: readonly ThemePreference[] = [
  'system',
  'light',
  'dark',
];

const MotionOptions: readonly MotionPreference[] = [
  'full',
  'reduced',
  'none',
];

const Content: SectionComponent = React.forwardRef((_props, ref) => {
  const id = useUniqueId();

  const {config, updateConfig} = useConfig();

  const {appearance} = config;

  const handleChangeTheme = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const nextTheme = e.target.value as ThemePreference;
    updateConfig(config => {
      config.appearance.theme = nextTheme;
    });
  }, [updateConfig]);

  const handleChangeColor = useCallback((
    kind: 'accentColor' | 'dangerColor' | 'sidebarColor',
    nextColor: ColorName
  ) => {
    updateConfig(config => {
      config.appearance[kind] = nextColor;
    });
  }, [updateConfig]);

  const handleSetZoomLevel = useCallback((nextZoomLevel: number) => {
    updateConfig(config => {
      config.appearance.zoomLevel = nextZoomLevel;
    });
  }, [updateConfig]);

  const handleChangeMotion = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const nextMotion = e.target.value as MotionPreference;
    updateConfig(config => {
      config.appearance.motion = nextMotion;
    });
  }, [updateConfig]);

  useImperativeHandle(ref, () => ({
    canLeave: true,
  }), []);

  return <>
    <S.OptionGroup aria-labelledby={`${id}-theme-label`}>
      <S.OptionGroupName id={`${id}-theme-label`}>
        <Localized id='settings-theme-label'/>
      </S.OptionGroupName>
      <S.OptionList>
        {ThemeOptions.map(key =>
          <Radio
            key={key}
            name={`${id}-theme`}
            value={key}
            checked={key === appearance.theme}
            onChange={handleChangeTheme}
          >
            <Localized id={`settings-theme-${key}`}/>
          </Radio>
        )}
      </S.OptionList>
    </S.OptionGroup>

    <S.OptionGroup aria-labelledby={`${id}-accent-color-label`}>
      <S.OptionGroupName id={`${id}-accent-color-label`}>
        <Localized id='settings-accent-color-label'/>
      </S.OptionGroupName>
      <ColorOptions
        name={`${id}-accent-color`}
        value={appearance.accentColor}
        onChange={color => handleChangeColor('accentColor', color)}
      />
    </S.OptionGroup>

    <S.OptionGroup
      aria-labelledby={`${id}-danger-color-label`}
      aria-describedby={`${id}-danger-color-desc`}
    >
      <S.OptionGroupName id={`${id}-danger-color-label`}>
        <Localized id='settings-danger-color-label'/>
      </S.OptionGroupName>
      <ColorOptions
        name={`${id}-danger-color`}
        value={appearance.dangerColor}
        onChange={color => handleChangeColor('dangerColor', color)}
      />
      <p id={`${id}-danger-color-desc`}>
        <Localized id='settings-danger-color-description'/>
      </p>
    </S.OptionGroup>

    <S.OptionGroup aria-labelledby={`${id}-sidebar-color-label`}>
      <S.OptionGroupName id={`${id}-sidebar-color-label`}>
        <Localized id='settings-sidebar-color-label'/>
      </S.OptionGroupName>
      <ColorOptions
        name={`${id}-sidebar-color`}
        value={appearance.sidebarColor}
        onChange={color => handleChangeColor('sidebarColor', color)}
      />
    </S.OptionGroup>

    <S.OptionGroup aria-labelledby={`${id}-zoom-label`}>
      <S.OptionGroupName id={`${id}-zoom-label`}>
        <Localized id='settings-zoom-level-label'/>
      </S.OptionGroupName>
      <ZoomSlider
        value={appearance.zoomLevel}
        aria-labelledby={`${id}-zoom-label`}
        aria-describedby={`${id}-zoom-level-desc`}
        onChange={handleSetZoomLevel}
      />
      <p id={`${id}-zoom-level-desc`}>
        <Localized id='settings-zoom-level-description'/>
      </p>
    </S.OptionGroup>

    <S.OptionGroup aria-labelledby={`${id}-motion-label`}>
      <S.OptionGroupName id={`${id}-motion-label`}>
        <Localized id='settings-motion-label'/>
      </S.OptionGroupName>
      <S.OptionList>
        {MotionOptions.map(key =>
          <Fragment key={key}>
            <Radio
              name={`${id}-motion`}
              value={key}
              checked={key === appearance.motion}
              aria-describedby={
                key !== 'full'
                  ? `${id}-motion-${key}-desc`
                  : undefined
              }
              onChange={handleChangeMotion}
            >
              <Localized id={`settings-motion-${key}`}/>
            </Radio>
            {key !== 'full' &&
              <S.OptionDescription id={`${id}-motion-${key}-desc`}>
                <Localized id={`settings-motion-${key}-description`}/>
              </S.OptionDescription>}
          </Fragment>
        )}
      </S.OptionList>
    </S.OptionGroup>
  </>;
});

Content.displayName = 'AppearanceSection';

const AppearanceSection: Section = {
  key: 'appearance',
  icon: <AppearanceIcon/>,
  content: Content,
};

export default AppearanceSection;
