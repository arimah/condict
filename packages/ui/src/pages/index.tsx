import React, {Key, ReactNode} from 'react';
import ChevronLeft from 'mdi-react/ChevronLeftIcon';
import ChevronRight from 'mdi-react/ChevronRightIcon';

import {SROnly} from '../a11y-utils';
import {Spinner} from '../spinner';

import * as S from './styles';

const atLeast = Math.max;
const atMost = Math.min;

const getBoundaries = (
  page: number,
  totalPages: number,
  context: number
): [number, number] => {
  const lastPage = totalPages - 1;
  // Initially, we display somewhat more pages than `context` alone would
  // demand. Suppose `context` is 1. In that case, we want to show enough
  // pages that clicking the "next" button doesn't introduce any additional
  // page buttons, i.e.:
  //   < [1] 2  3  4  5  …  20 >
  //   <  1 [2] 3  4  5  …  20 >
  //   <  1  2 [3] 4  5  …  20 >
  //   <  1  2  3 [4] 5  …  20 >
  //   <  1  …  4 [5] 6  …  20 >
  // and so on. The number of extra pages is 2 (page 1 + ellipsis/page 2)
  // plus 2 * `context`. The same applies at the end:
  //   <  1  …  16  17  18  19 [20] >
  //   <  1  …  16  17  18 [19] 20  >
  //   <  1  …  16  17 [18] 19  20  >
  const pagesAroundEdge = 2 + 2 * context;

  const start = atLeast(
    atMost(page - context, lastPage - pagesAroundEdge),
    0
  );
  const end = atMost(
    atLeast(page + context, pagesAroundEdge),
    lastPage
  );

  return [start, end];
};

type ExtraPageProps = {
  label?: string;
  current?: boolean;
  disabled?: boolean;
  children?: ReactNode;
};

type PageGenerator = (key: Key, page: number, extraProps?: ExtraPageProps) => ReactNode;

const addStartPages = (
  pageNodes: ReactNode[],
  getPage: PageGenerator,
  start: number
) => {
  if (start > 0) {
    pageNodes.push(getPage(0, 0));
    if (start === 2) {
      pageNodes.push(getPage(1, 1));
    } else if (start >= 3) {
      pageNodes.push(
        <S.Item key='ellipsis-start'>
          <S.Ellipsis>
            <SROnly>
              Pages 2 to {start} omitted
            </SROnly>
            &hellip;
          </S.Ellipsis>
        </S.Item>
      );
    }
  }
};

const addEndPages = (
  pageNodes: ReactNode[],
  getPage: PageGenerator,
  lastPage: number,
  end: number
) => {
  const pagesFromLast = lastPage - end;
  if (pagesFromLast > 0) {
    if (pagesFromLast === 2) {
      pageNodes.push(getPage(lastPage - 1, lastPage - 1));
    } else if (pagesFromLast >= 3) {
      pageNodes.push(
        <S.Item key='ellipsis-end'>
          <S.Ellipsis>
            <SROnly>
              Pages {end + 2} to {lastPage} omitted
            </SROnly>
            &hellip;
          </S.Ellipsis>
        </S.Item>
      );
    }
    pageNodes.push(getPage(lastPage, lastPage));
  }
};

const addRelativeNav = (
  pageNodes: ReactNode[],
  getPage: PageGenerator,
  page: number,
  lastPage: number
) => {
  if (lastPage > 0) {
    pageNodes.unshift(getPage('prev', page - 1, {
      label: 'Previous page',
      children: <ChevronLeft/>,
      disabled: page === 0,
    }));
    pageNodes.push(getPage('next', page + 1, {
      label: 'Next page',
      children: <ChevronRight/>,
      disabled: page === lastPage,
    }));
  }
};

export type Props = {
  className?: string;
  page?: number;
  totalPages?: number;
  context?: number;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  onChange: (page: number) => void;
};

export const Pages = React.forwardRef<HTMLElement, Props>((
  props: Props,
  ref
) => {
  const {
    className,
    page = 0,
    totalPages = 1,
    context = 2,
    label,
    loading = false,
    disabled = false,
    onChange,
  } = props;

  const lastPage = totalPages - 1;
  const [start, end] = getBoundaries(page, totalPages, context);

  const getPage: PageGenerator = (key, p, extraProps = {}) =>
    <S.Item key={key}>
      <S.Page
        label={extraProps.label || `Page ${p + 1} of ${totalPages}`}
        aria-current={extraProps.current ? 'page' : undefined}
        aria-busy={extraProps.current ? loading : undefined}
        current={extraProps.current}
        isLoading={extraProps.current && loading}
        disabled={extraProps.disabled || disabled}
        onClick={() => onChange(p)}
      >
        {extraProps.children || p + 1}
      </S.Page>
      {extraProps.current && loading &&
        <S.Loading>
          <Spinner size={20}/>
        </S.Loading>
      }
    </S.Item>;

  const pageNodes: ReactNode[] = [];
  addStartPages(pageNodes, getPage, start);
  for (let p = start; p <= end; p++) {
    pageNodes.push(getPage(p, p, {current: p === page}));
  }
  addEndPages(pageNodes, getPage, lastPage, end);
  addRelativeNav(pageNodes, getPage, page, lastPage);

  return (
    <S.Main
      className={className}
      aria-label={label}
      disabled={disabled}
      ref={ref}
    >
      <S.List>
        {pageNodes}
      </S.List>
    </S.Main>
  );
});

Pages.displayName = 'Pages';
