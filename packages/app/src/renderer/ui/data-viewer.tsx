import {ReactNode} from 'react';
import {Localized} from '@fluent/react';

import {ExecuteError} from '../../types';

import {QueryResult} from '../data';
import {Query, OperationResult} from '../graphql';

import Loading from './loading';

export type Props<Q extends Query<any, any>> = {
  result: QueryResult<Q>;
  allowErrors?: boolean;
  renderLoading?: () => ReactNode;
  renderErrors?: (errors: readonly ExecuteError[]) => ReactNode;
  renderNoData?: () => ReactNode;
  render: (
    data: OperationResult<Q>,
    errors: readonly ExecuteError[] | null
  ) => ReactNode;
};

function DataViewer<Q extends Query<any, any>>(props: Props<Q>): JSX.Element {
  const {
    result,
    allowErrors = false,
    renderLoading = renderLoadingDefault,
    renderErrors = renderErrorsDefault,
    renderNoData = renderNoDataDefault,
    render,
  } = props;

  if (result.state === 'loading') {
    return <>{renderLoading()}</>;
  }

  const {data, errors} = result.result;
  if (!allowErrors && errors && errors.length > 0) {
    // Errors are always more severe than missing data, so take precedence.
    // Often an error causes missing data, too.
    return <>{renderErrors(errors)}</>;
  }

  // data being null is always an error, even if allowErrors is true.
  if (data == null) {
    return <>{renderNoData()}</>;
  }

  return <>{render(data, errors ?? null)}</>;
}

export default DataViewer;

const renderLoadingDefault = () => <Loading delay={150}/>;

const renderErrorsDefault = (errors: readonly ExecuteError[]) =>
  // TODO: Improved error display thing
  <>
    <p>
      <Localized
        id='fetch-error'
        vars={{errorCount: errors.length}}
      />
    </p>
    <ul>
      {errors.map((err, i) =>
        <li key={i}>
          {err.message}
        </li>
      )}
    </ul>
  </>;

const renderNoDataDefault = () => <p><Localized id='fetch-no-data'/></p>;
