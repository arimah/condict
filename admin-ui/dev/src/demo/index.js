import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import genId from '@condict/gen-id';

import * as S from './styles';

class Demo extends PureComponent {
  constructor() {
    super();

    this.state = {
      error: null,
    };

    this.headingId = genId();

    this.handleSetState = this.handleSetState.bind(this);
    this.handleToggleState = this.handleToggleState.bind(this);
  }

  handleSetState(partialState) {
    this.props.onSetState(this.props.name, partialState);
  }

  handleToggleState(key) {
    this.props.onToggleState(this.props.name, key);
  }

  render() {
    const {
      name,
      state,
      controls,
      contents,
    } = this.props;
    const {error} = this.state;

    return (
      <section aria-labelledby={this.headingId}>
        <h2 id={this.headingId}>{name}</h2>

        {error ? (
          <Error error={error}/>
        ) : (
          <InteractiveDemo
            state={state}
            controls={controls}
            contents={contents}
            onSetState={this.handleSetState}
            onToggleState={this.handleToggleState}
          />
        )}
      </section>
    );
  }

  componentDidCatch(_error, _info) {
  }

  static getDerivedStateFromError(error) {
    return {error};
  }
}

Demo.propTypes = {
  name: PropTypes.string.isRequired,
  state: PropTypes.object.isRequired,
  controls: PropTypes.func,
  contents: PropTypes.func.isRequired,
  onSetState: PropTypes.func.isRequired,
  onToggleState: PropTypes.func.isRequired,
};

Demo.defaultProps = {
  controls: null,
};

const Error = ({error}) =>
  <S.ErrorContainer>
    <S.ErrorMessage>{error.name}: {error.message}</S.ErrorMessage>
    <S.ErrorStack>{error.stack}</S.ErrorStack>
  </S.ErrorContainer>;

Error.propTypes = {
  error: PropTypes.shape({
    name: PropTypes.string,
    message: PropTypes.string,
    stack: PropTypes.string,
  }).isRequired,
};

Demo.List = S.List;

Demo.Row = S.Row;

const InteractiveDemo = props => {
  const {
    state,
    controls,
    contents,
    onSetState,
    onToggleState,
  } = props;

  return (
    <S.Interactive>
      <S.InteractiveContents>
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

InteractiveDemo.propTypes = {
  state: PropTypes.object.isRequired,
  controls: PropTypes.func,
  contents: PropTypes.func.isRequired,
  onSetState: PropTypes.func.isRequired,
  onToggleState: PropTypes.func.isRequired,
};

InteractiveDemo.defaultProps = {
  controls: null,
};

export default Demo;
