import {ReactNode} from 'react';
import {Localized} from '@fluent/react';

import {ExecuteError} from '../../types';

import {QueryResult} from '../data';
import {Query, OperationResult} from '../graphql';

import Loading from './loading';

export interface Options<Q extends Query<any, any>> {
  render: (data: OperationResult<Q>) => ReactNode;
  renderLoading?: () => ReactNode;
  renderErrors?: (errors: readonly ExecuteError[]) => ReactNode;
  renderNoData?: () => ReactNode;
}

export type RenderDataFn<Q extends Query<any, any>> =
  (data: OperationResult<Q>) => ReactNode;

export function renderData<Q extends Query<any, any>>(
  result: QueryResult<Q>,
  renderOrOptions: Options<Q> | RenderDataFn<Q>
): ReactNode {
  const {
    render,
    renderLoading = renderLoadingDefault,
    renderErrors = renderErrorsDefault,
    renderNoData = renderNoDataDefault,
  }: Options<Q> =
    typeof renderOrOptions === 'function'
      ? {render: renderOrOptions}
      : renderOrOptions;
  if (result.state === 'loading') {
    return renderLoading();
  }

  const {data, errors} = result.result;
  if (errors && errors.length > 0) {
    // Errors are always more severe than missing data, so take precedence.
    // Often an error causes missing data, too.
    return <>{renderErrors(errors)}</>;
  }
  if (data == null) {
    return renderNoData();
  }
  return render(data);
}

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
