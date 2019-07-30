import React from 'react';
import PropTypes from 'prop-types';
import ChevronLeft from 'mdi-react/ChevronLeftIcon';
import ChevronRight from 'mdi-react/ChevronRightIcon';

import {SROnly} from '@condict/a11y-utils';

import {Spinner} from '../spinner';

import * as S from './styles';

const atLeast = Math.max;
const atMost = Math.min;

const getBoundaries = (page, totalPages, context) => {
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

const addStartPages = (pageNodes, getPage, start) => {
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

const addEndPages = (pageNodes, getPage, lastPage, end) => {
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

const addRelativeNav = (pageNodes, getPage, page, lastPage) => {
  if (lastPage > 0) {
    pageNodes.unshift(getPage('prev', page - 1, {
      label: 'Previous page',
      children: <ChevronLeft size={20}/>,
      disabled: page === 0,
    }));
    pageNodes.push(getPage('next', page + 1, {
      label: 'Next page',
      children: <ChevronRight size={20}/>,
      disabled: page === lastPage,
    }));
  }
};

export const Pages = React.forwardRef((props, ref) => {
  const {
    className,
    page,
    totalPages,
    context,
    label,
    loading,
    disabled,
    onChange,
  } = props;

  const lastPage = totalPages - 1;
  const [start, end] = getBoundaries(page, totalPages, context);

  const getPage = (key, p, extraProps = {}) =>
    <S.Item key={key}>
      <S.Page
        label={extraProps.label || `Page ${p + 1} of ${totalPages}`}
        aria-current={extraProps.current ? 'page' : undefined}
        aria-busy={extraProps.current && loading ? 'true' : undefined}
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

  const pageNodes = [];
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

Pages.propTypes = {
  className: PropTypes.string,
  page: PropTypes.number,
  totalPages: PropTypes.number,
  context: PropTypes.number,
  label: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

Pages.defaultProps = {
  className: '',
  page: 0,
  totalPages: 1,
  context: 2,
  label: undefined,
  loading: false,
  disabled: false,
  onChange: () => { },
};
