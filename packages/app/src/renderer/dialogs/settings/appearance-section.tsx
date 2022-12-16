import React, {
  Fragment,
  ChangeEvent,
  memo,
  useCallback,
  useImperativeHandle,
} from 'react';
import {Localized, useLocalization} from '@fluent/react';
import AppearanceIcon from 'mdi-react/PaletteIcon';

import {
  Radio,
  MotionPreference,
  FontSizeOption,
  LineHeightOption,
  useUniqueId,
} from '@condict/ui';

import {ColorName, ThemePreference} from '../../../types';

import {useConfig} from '../../app-contexts';
import {ConfigRecipe} from '../../types';

import ColorOptions from './color-options';
import Slider, {SliderStop} from './slider';
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

const FontSizes: readonly SliderStop<FontSizeOption>[] = [
  {pos: 13, value: '13'},
  {pos: 14, value: '14'},
  {pos: 15, value: '15'},
  {pos: 16, value: '16'},
  {pos: 18, value: '18'},
];

const LineHeights: readonly SliderStop<LineHeightOption>[] = [
  {pos: 1.25, value: '1.25'},
  {pos: 1.5, value: '1.5'},
  {pos: 1.75, value: '1.75'},
  {pos: 2, value: '2'},
];

const ZoomLevels: readonly SliderStop<number>[] = [
  {pos: 50, value: 50},
  {pos: 67, value: 67},
  {pos: 75, value: 75},
  {pos: 90, value: 90},
  {pos: 100, value: 100},
  {pos: 110, value: 110},
  {pos: 125, value: 125},
  {pos: 150, value: 150},
  {pos: 175, value: 175},
  {pos: 200, value: 200},
];

const Content: SectionComponent = React.forwardRef((_props, ref) => {
  const {config, updateConfig} = useConfig();

  useImperativeHandle(ref, () => ({
    canLeave: true,
  }), []);

  const {appearance} = config;

  return <>
    <ThemeSettings
      theme={appearance.theme}
      update={updateConfig}
    />
    <ColorSettings
      accentColor={appearance.accentColor}
      dangerColor={appearance.dangerColor}
      sidebarColor={appearance.sidebarColor}
      update={updateConfig}
    />
    <TextSizeSettings
      fontSize={appearance.fontSize}
      lineHeight={appearance.lineHeight}
      update={updateConfig}
    />
    <ZoomLevelSettings
      zoomLevel={appearance.zoomLevel}
      update={updateConfig}
    />
    <MotionSettings
      motion={appearance.motion}
      update={updateConfig}
    />
  </>;
});

Content.displayName = 'AppearanceSection';

const AppearanceSection: Section = {
  key: 'appearance',
  icon: <AppearanceIcon/>,
  content: Content,
};

export default AppearanceSection;

interface ThemeSettingsProps {
  theme: ThemePreference;
  update: (recipe: ConfigRecipe) => void;
}

const ThemeSettings = memo((props: ThemeSettingsProps): JSX.Element => {
  const {theme, update: updateConfig} = props;

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const nextTheme = e.target.value as ThemePreference;
    updateConfig(config => {
      config.appearance.theme = nextTheme;
    });
  }, [updateConfig]);

  const id = useUniqueId();

  return (
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
            checked={key === theme}
            onChange={handleChange}
          >
            <Localized id={`settings-theme-${key}`}/>
          </Radio>
        )}
      </S.OptionList>
    </S.OptionGroup>
  );
});

ThemeSettings.displayName = 'ThemeSettings';

interface ColorSettingsProps {
  accentColor: ColorName;
  dangerColor: ColorName;
  sidebarColor: ColorName;
  update: (recipe: ConfigRecipe) => void;
}

const ColorSettings = memo((props: ColorSettingsProps): JSX.Element => {
  const {accentColor, dangerColor, sidebarColor, update: updateConfig} = props;

  const handleChange = useCallback((
    kind: 'accentColor' | 'dangerColor' | 'sidebarColor',
    nextColor: ColorName
  ) => {
    updateConfig(config => {
      config.appearance[kind] = nextColor;
    });
  }, [updateConfig]);

  const id = useUniqueId();

  return <>
    <S.OptionGroup aria-labelledby={`${id}-accent-color-label`}>
      <S.OptionGroupName id={`${id}-accent-color-label`}>
        <Localized id='settings-accent-color-label'/>
      </S.OptionGroupName>
      <ColorOptions
        name={`${id}-accent-color`}
        value={accentColor}
        onChange={color => handleChange('accentColor', color)}
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
        value={dangerColor}
        onChange={color => handleChange('dangerColor', color)}
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
        value={sidebarColor}
        onChange={color => handleChange('sidebarColor', color)}
      />
    </S.OptionGroup>
  </>;
});

ColorSettings.displayName = 'ColorSettings';

interface TextSizeSettingsProps {
  fontSize: FontSizeOption;
  lineHeight: LineHeightOption;
  update: (recipe: ConfigRecipe) => void;
}

const TextSizeSettings = memo((props: TextSizeSettingsProps): JSX.Element => {
  const {fontSize, lineHeight, update: updateConfig} = props;

  const {l10n} = useLocalization();

  const renderFontSize = useCallback((value: FontSizeOption): string => {
    return l10n.getString('settings-font-size-value', {value: Number(value)});
  }, [l10n]);

  const handleSetFontSize = useCallback((value: FontSizeOption) => {
    updateConfig(config => {
      config.appearance.fontSize = value;
    });
  }, [updateConfig]);

  const renderLineHeight = useCallback((
    _value: LineHeightOption,
    index: number
  ): string => {
    return l10n.getString('settings-line-height-value', {value: index});
  }, [l10n]);

  const handleSetLineHeight = useCallback((value: LineHeightOption) => {
    updateConfig(config => {
      config.appearance.lineHeight = value;
    });
  }, [updateConfig]);

  const id = useUniqueId();

  return (
    <S.TextSizeOptions>
      <S.OptionGroup aria-labelledby={`${id}-font-size-label`}>
        <S.OptionGroupName id={`${id}-font-size-label`}>
          <Localized id='settings-font-size-label'/>
        </S.OptionGroupName>
        <Slider
          stops={FontSizes}
          value={fontSize}
          renderValue={renderFontSize}
          aria-labelledby={`${id}-font-size-label`}
          aria-describedby={`${id}-font-size-desc`}
          onChange={handleSetFontSize}
        />
        <p id={`${id}-font-size-desc`}>
          <Localized id='settings-font-size-description'/>
        </p>
      </S.OptionGroup>

      <S.OptionGroup aria-labelledby={`${id}-line-height-label`}>
        <S.OptionGroupName id={`${id}-line-height-label`}>
          <Localized id='settings-line-height-label'/>
        </S.OptionGroupName>
        <Slider
          stops={LineHeights}
          value={lineHeight}
          renderValue={renderLineHeight}
          aria-labelledby={`${id}-line-height-label`}
          onChange={handleSetLineHeight}
        />
      </S.OptionGroup>
    </S.TextSizeOptions>
  );
});

TextSizeSettings.displayName = 'TextSizeSettings';

interface ZoomLevelSettingsProps {
  zoomLevel: number;
  update: (recipe: ConfigRecipe) => void;
}

const ZoomLevelSettings = memo((props: ZoomLevelSettingsProps): JSX.Element => {
  const {zoomLevel, update: updateConfig} = props;

  const {l10n} = useLocalization();

  const renderZoomLevel = useCallback((value: number): string => {
    return l10n.getString('settings-zoom-level-value', {value});
  }, [l10n]);

  const handleChange = useCallback((value: number) => {
    updateConfig(config => {
      config.appearance.zoomLevel = value;
    });
  }, [updateConfig]);

  const id = useUniqueId();

  return (
    <S.OptionGroup aria-labelledby={`${id}-zoom-label`}>
      <S.OptionGroupName id={`${id}-zoom-label`}>
        <Localized id='settings-zoom-level-label'/>
      </S.OptionGroupName>
      <Slider
        stops={ZoomLevels}
        value={zoomLevel}
        renderValue={renderZoomLevel}
        aria-labelledby={`${id}-zoom-label`}
        aria-describedby={`${id}-zoom-desc`}
        onChange={handleChange}
      />
      <p id={`${id}-zoom-desc`}>
        <Localized id='settings-zoom-level-description'/>
      </p>
    </S.OptionGroup>
  );
});

ZoomLevelSettings.displayName = 'ZoomLevelSettings';

interface MotionSettingsProps {
  motion: MotionPreference;
  update: (recipe: ConfigRecipe) => void;
}

const MotionSettings = memo((props: MotionSettingsProps): JSX.Element => {
  const {motion, update: updateConfig} = props;

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const nextMotion = e.target.value as MotionPreference;
    updateConfig(config => {
      config.appearance.motion = nextMotion;
    });
  }, [updateConfig]);

  const id = useUniqueId();

  return (
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
              checked={key === motion}
              aria-describedby={
                key !== 'full'
                  ? `${id}-motion-${key}-desc`
                  : undefined
              }
              onChange={handleChange}
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
  );
});

MotionSettings.displayName = 'MotionSettings';
