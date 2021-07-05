import styled from 'styled-components';

export const SliderThumb = styled.div`
  box-sizing: border-box;
  margin-inline-start: -5px;
  position: absolute;
  top: 20px;
  bottom: 0;
  width: 10px;
  height: 24px;
  background-color: ${p => p.theme.accent.boldBg};
  border-radius: 4px;
`;

export const Main = styled.div.attrs({
  role: 'slider',
  tabIndex: 0,
})`
  margin-block: 8px;
  margin-inline: 20px;
  padding-block: 28px 8px;
  position: relative;
  max-width: 720px;

  &:hover > ${SliderThumb} {
    background-color: ${p => p.theme.accent.boldHoverBg};
  }

  &:focus {
    outline: none;

    > ${SliderThumb} {
      box-shadow: ${p => p.theme.focus.shadow};
      background-color: ${p => p.theme.focus.color};
    }
  }
`;

export const SliderTrack = styled.div`
  box-sizing: border-box;
  height: 8px;
  margin-inline: -5px;
  padding-inline: 5px;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background-color: ${p => p.theme.general.bg};
`;

export const SliderTrackFill = styled.div`
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  background-color: ${p => p.theme.accent.boldBg};
`;

export const SliderTick = styled.div`
  position: absolute;
  margin-left: -1px;
  top: 20px;
  bottom: 0px;
  width: 2px;
  background-color: ${p => p.theme.general.activeBg};
`;

export type SliderTickLabelProps = {
  $selected: boolean;
};

export const SliderTickLabel = styled.span<SliderTickLabelProps>`
  position: absolute;
  margin-bottom: 2px;
  font-weight: 500;
  font-size: 11px;
  line-height: 12px;
  /* use proportional digits here */
  font-feature-settings: 'tnum' off;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  color: ${p => p.$selected && p.theme.accent.defaultFg};
`;
