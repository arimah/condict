import React, {PureComponent} from 'react';

import genId from '@condict/gen-id';

import {
  ControlsRenderFunc,
  ContentRenderFunc,
} from '../components/types';

import * as S from './styles';

export type Props = {
  name: string;
  state: object;
  controls?: ControlsRenderFunc<object>;
  contents: ContentRenderFunc<object>;
  alignX: 'center' | 'stretch';
  alignY: 'center' | 'stretch';
  onSetState: (demoName: string, partialState: object) => void;
  onToggleState: (demoName: string, key: string) => void;
};

export type State = {
  error: Error | null;
};

class Demo extends PureComponent<Props, State> {
  public static defaultProps = {
    controls: undefined,
    alignX: 'center',
    alignY: 'center',
  };

  public static List = S.List;
  public static Row = S.Row;

  private headingId = genId();

  public state: State = {
    error: null,
  };

  private handleSetState = (partialState: object) => {
    this.props.onSetState(this.props.name, partialState);
  };

  private handleToggleState = (key: string) => {
    this.props.onToggleState(this.props.name, key);
  };

  public render(): JSX.Element {
    const {
      name,
      state,
      controls,
      contents,
      alignX,
      alignY,
    } = this.props;
    const {error} = this.state;

    return (
      <section aria-labelledby={this.headingId}>
        <h2 id={this.headingId}>{name}</h2>

        {error ? (
          <ErrorDisplay error={error}/>
        ) : (
          <InteractiveDemo
            state={state}
            controls={controls}
            contents={contents}
            alignX={alignX}
            alignY={alignY}
            onSetState={this.handleSetState}
            onToggleState={this.handleToggleState}
          />
        )}
      </section>
    );
  }

  public componentDidCatch(_error: Error, _info: unknown): void {
    // Deliberately empty to suppress error messages in the console.
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {error};
  }
}

type ErrorDisplayProps = {
  error: Error;
};

const ErrorDisplay = ({error}: ErrorDisplayProps) =>
  <S.ErrorContainer>
    <S.ErrorMessage>{error.name}: {error.message}</S.ErrorMessage>
    <S.ErrorStack>{error.stack}</S.ErrorStack>
  </S.ErrorContainer>;

type InteractiveDemoProps = {
  state: object;
  controls?: ControlsRenderFunc<object>;
  contents: ContentRenderFunc<object>;
  alignX: 'center' | 'stretch';
  alignY: 'center' | 'stretch';
  onSetState: (partialState: object) => void;
  onToggleState: (key: string) => void;
};

const InteractiveDemo = (props: InteractiveDemoProps) => {
  const {
    state,
    controls,
    contents,
    alignX,
    alignY,
    onSetState,
    onToggleState,
  } = props;

  return (
    <S.Interactive>
      <S.InteractiveContents alignX={alignX} alignY={alignY}>
        {contents(state, onSetState, onToggleState)}
      </S.InteractiveContents>
      {controls &&
        <S.InteractiveControls>
          {controls(state, onSetState, onToggleState).map((control, i) =>
            <S.InteractiveControl key={i}>
              {control}
            </S.InteractiveControl>
          )}
        </S.InteractiveControls>
      }
    </S.Interactive>
  );
};

export default Demo;
