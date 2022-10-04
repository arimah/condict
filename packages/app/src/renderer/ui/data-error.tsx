import {Localized} from '@fluent/react';

import {ExecuteError} from '../../types';

export interface Props {
  errors: readonly ExecuteError[];
}

const DataError = (props: Props): JSX.Element => {
  const {errors} = props;
  // TODO: Improved error display thing
  return <>
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
};

export default DataError;
