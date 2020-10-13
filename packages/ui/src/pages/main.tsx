import React, {ReactNode, Ref, useMemo} from 'react';
import ChevronLeft from 'mdi-react/ChevronLeftIcon';
import ChevronRight from 'mdi-react/ChevronRightIcon';

import Page, {Ellipsis} from './page';
import DefaultMessages from './messages';
import {PageContext, PageContextValue, Messages} from './types';
import * as S from './styles';

const atLeast = Math.max;
const atMost = Math.min;

export type Props = {
  className?: string;
  page?: number;
  totalPages?: number;
  context?: number;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  messages?: Messages;
  onChange: (page: number) => void;
};

export const Pages = React.forwardRef((props: Props, ref: Ref<HTMLElement>) => {
  const {
    className,
    page = 0,
    totalPages = 1,
    context = 2,
    label,
    loading = false,
    disabled = false,
    messages = DefaultMessages,
    onChange,
  } = props;

  const lastPage = totalPages - 1;

  const [start, end] = useMemo<[number, number]>(() => {
    // Initially, we display somewhat more pages than `context` alone would
    // demand. We want to show enough pages that clicking the "next" button
    // doesn't introduce any additional page buttons. E.g. when context = 1:
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
  }, [page, lastPage, context]);

  const pageContext = useMemo<PageContextValue>(() => ({
    totalPages,
    loading,
    disabled,
    messages,
    onChange,
  }), [totalPages, loading, disabled, messages, onChange]);

  // It would be quite nice if we could inline the start and end pages in the
  // main JSX expression below, but we actually do need to have all the page
  // buttons in the same array. If we didn't, identical-looking page buttons
  // would be forced to mount and unmount as the user navigates, causing loss
  // of keyboard focus.
  const pages: ReactNode[] = [];

  if (start > 0) {
    pages.push(<Page key={0} page={0}/>);

    if (start === 2) {
      pages.push(<Page key={1} page={1}/>);
    }

    if (start >= 3) {
      pages.push(<Ellipsis key='ellipsis-start' start={1} end={start - 1}/>);
    }
  }

  for (let p = start; p <= end; p++) {
    pages.push(<Page key={p} page={p} isCurrent={p === page}/>);
  }

  const pagesFromLast = lastPage - end;
  if (pagesFromLast > 0) {
    if (pagesFromLast >= 3) {
      pages.push(
        <Ellipsis key='ellipsis-end' start={end + 1} end={lastPage - 1}/>
      );
    }

    if (pagesFromLast === 2) {
      pages.push(<Page key={lastPage - 1} page={lastPage - 1}/>);
    }

    pages.push(<Page key={lastPage} page={lastPage}/>);
  }

  return (
    <S.Main
      className={className}
      aria-label={label}
      disabled={disabled}
      ref={ref}
    >
      <S.List>
        <PageContext.Provider value={pageContext}>
          <Page
            label={messages.prevPage()}
            page={page - 1}
            disabled={page === 0}
          >
            <ChevronLeft/>
          </Page>

          {pages}

          <Page
            label={messages.nextPage()}
            page={page + 1}
            disabled={page === lastPage}
          >
            <ChevronRight/>
          </Page>
        </PageContext.Provider>
      </S.List>
    </S.Main>
  );
});

Pages.displayName = 'Pages';
