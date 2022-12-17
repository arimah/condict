import styled from 'styled-components';

export const SliderThumb = styled.div`
  box-sizing: border-box;
  margin-inline-start: -5px;
  position: absolute;
  top: 20px;
  bottom: 0;
  width: 10px;
  height: 24px;
  background-color: var(--slider-thumb-bg);
  border-radius: 4px;

  *:hover > & {
    background-color: var(--slider-thumb-bg-hover);
  }

  *:focus > & {
    background-color: var(--focus-border);
  }
`;

export const Main = styled.div.attrs({
  role: 'slider',
  tabIndex: 0,
})`
  margin-block: 8px;
  margin-inline: 20px;
  padding-block: 28px 8px;
  position: relative;
  max-width: min(51.5rem, 800px);

  &:focus {
    outline: none;
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
  background-color: var(--slider-track-bg);
`;

export const SliderTrackFill = styled.div`
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  background-color: var(--slider-track-fill-bg);
`;

export const SliderTick = styled.div`
  position: absolute;
  margin-left: -1px;
  top: 20px;
  bottom: 0px;
  width: 2px;
  background-color: var(--slider-tick-bg);
`;

export const SliderTickLabel = styled.span<{
  $selected: boolean;
}>`
  position: absolute;
  margin-bottom: 2px;
  font-weight: 500;
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
  /* use proportional digits here */
  font-feature-settings: 'tnum' off;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  color: var(${p => p.$selected
    ? '--slider-tick-fg-selected'
    : '--slider-tick-fg'
  });
`;
