import {RefObject, useEffect} from 'react';

import {Query, OperationArgs, OperationResult} from '../graphql';
import {QueryResult, EventPredicate, useLiveData, hasData} from '../data';
import {useUpdateTab} from '../navigation';
import {FocusFn, useRefocusOnData} from '../hooks';

export interface Params<Q extends Query<any, any>> {
  args: OperationArgs<Q>;

  shouldReload: EventPredicate;

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
): QueryResult<OperationResult<Q>> => {
  const {
    args,
    shouldReload,
    pageTitle,
    isEmpty,
    dataFocus,
    errorFocus,
    emptyFocus,
    pageRef,
  } = params;

  const data = useLiveData(query, args, shouldReload);

  useRefocusOnData(data, {
    isEmpty,
    focus: dataFocus,
    errorFocus,
    emptyFocus,
    ownedElem: pageRef,
  });

  const title = hasData(data) && pageTitle?.(data.data);

  const updateTab = useUpdateTab();
  useEffect(() => {
    if (title) {
      updateTab({title});
    }
  }, [title]);

  return data;
};

export default usePageData;
