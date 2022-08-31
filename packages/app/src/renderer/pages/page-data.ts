import {RefObject, useEffect} from 'react';

import {Query, OperationArgs, OperationResult} from '../graphql';
import {QueryResult, EventPredicate, useData} from '../data';
import {useUpdateTab} from '../navigation';
import {FocusFn, useRefocusOnData} from '../hooks';

export interface Params<Q extends Query<any, any>> {
  args: OperationArgs<Q>;

  reloadOn: EventPredicate;

  pageTitle?: (data: OperationResult<Q>) => string | undefined;

  isEmpty?: (data: OperationResult<Q>) => boolean;
  dataFocus?: RefObject<HTMLElement> | FocusFn;
  errorFocus?: RefObject<HTMLElement> | FocusFn;
  emptyFocus?: RefObject<HTMLElement> | FocusFn;
  pageRef: RefObject<HTMLElement>;
}

const usePageData = <Q extends Query<any, any>>(
  query: Q,
  params: Params<Q>
): QueryResult<Q> => {
  const {
    args,
    reloadOn,
    pageTitle,
    isEmpty,
    dataFocus,
    errorFocus,
    emptyFocus,
    pageRef,
  } = params;

  const data = useData(query, args, reloadOn);

  useRefocusOnData(data, {
    isEmpty,
    focus: dataFocus,
    errorFocus,
    emptyFocus,
    ownedElem: pageRef,
  });

  const title =
    pageTitle &&
    data.state === 'data' &&
    data.result.data &&
    pageTitle(data.result.data);

  const updateTab = useUpdateTab();
  useEffect(() => {
    if (title) {
      updateTab({title});
    }
  }, [title]);

  return data;
};

export default usePageData;
