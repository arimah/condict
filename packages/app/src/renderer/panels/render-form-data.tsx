import {ReactNode} from 'react';
import {Localized} from '@fluent/react';

import {Button} from '@condict/ui';

import {ExecuteError} from '../../types';

import {DataError, RenderDataFn, renderData} from '../ui';
import {QueryResult} from '../data';
import {Query} from '../graphql';

export default function renderFormData<Q extends Query<any, any>>(
  result: QueryResult<Q>,
  onClose: () => void,
  render: RenderDataFn<Q>
): ReactNode {
  return renderData(result, {
    render,
    renderErrors: errors => renderErrors(errors, onClose),
    renderNoData: () => renderNoData(onClose),
  });
}

const renderErrors = (
  errors: readonly ExecuteError[],
  onClose: () => void
): ReactNode => <>
  <DataError errors={errors}/>
  <p>
    <Button onClick={() => onClose()}>
      <Localized id='generic-close-button'/>
    </Button>
  </p>
</>;

const renderNoData = (onClose: () => void): ReactNode => <>
  <p><Localized id='fetch-no-data'/></p>
  <p>
    <Button onClick={() => onClose()}>
      <Localized id='generic-close-button'/>
    </Button>
  </p>
</>;
