import {ReactNode} from 'react';
import {Localized} from '@fluent/react';

import {ExecuteError} from '../../types';

import {QueryResult} from '../data';

import Loading from './loading';
import DataError from './data-error';

export interface Options<T> {
  render: (data: T) => ReactNode;
  renderLoading?: () => ReactNode;
  renderErrors?: (errors: readonly ExecuteError[]) => ReactNode;
  renderNoData?: () => ReactNode;
}

export type RenderDataFn<T> = (data: T) => ReactNode;

export function renderData<T>(
  result: QueryResult<T>,
  renderOrOptions: Options<T> | RenderDataFn<T>
): ReactNode {
  const {
    render,
    renderLoading = renderLoadingDefault,
    renderErrors = renderErrorsDefault,
    renderNoData = renderNoDataDefault,
  }: Options<T> =
    typeof renderOrOptions === 'function'
      ? {render: renderOrOptions}
      : renderOrOptions;
  if (result.state === 'loading') {
    return renderLoading();
  }
  if (result.state === 'error') {
    return <>{renderErrors(result.errors)}</>;
  }
  if (result.data == null) {
    return renderNoData();
  }
  return render(result.data);
}

const renderLoadingDefault = () => <Loading delay={150}/>;

const renderErrorsDefault = (errors: readonly ExecuteError[]) =>
  <DataError errors={errors}/>;

const renderNoDataDefault = () => <p><Localized id='fetch-no-data'/></p>;
