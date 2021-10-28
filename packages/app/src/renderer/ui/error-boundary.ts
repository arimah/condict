import {Component, ReactNode} from 'react';

export type Props = {
  maxRetries: number;
  renderError: (error: Error, retry: () => void) => ReactNode;
  onErrorCaught: (error: Error) => void;
  children: ReactNode;
};

type State = {
  error: Error | null;
  retryNumber: number;
};

export default class ErrorBoundary extends Component<Props, State> {
  public static defaultProps = {
    maxRetries: 0,
    renderError: (): ReactNode => null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onErrorCaught: (): void => { },
  };

  public state: State = {
    error: null,
    retryNumber: 0,
  };

  /**
   * Clears the current error and attempts to re-render the normal content.
   */
  public retry = (): void => {
    if (this.state.error) {
      this.setState({
        error: null,
        retryNumber: 0,
      });
    }
  };

  public render(): ReactNode {
    const {maxRetries, renderError, children} = this.props;
    const {error, retryNumber} = this.state;

    if (error && retryNumber > maxRetries) {
      return renderError(error, this.retry);
    }
    return children;
  }

  public componentDidCatch(error: Error): void {
    const {retryNumber} = this.state;
    this.setState({
      error,
      retryNumber: retryNumber + 1,
    });
    this.props.onErrorCaught(error);
  }
}
