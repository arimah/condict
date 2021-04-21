import React, {ReactNode, useContext} from 'react';

import {SROnly} from '../a11y-utils';
import {Spinner} from '../spinner';

import {PageContext} from './types';
import * as S from './styles';

export type Props = {
  page: number;
  isCurrent?: boolean;
  label?: string;
  disabled?: boolean;
  children?: ReactNode;
};

const Page = (props: Props): JSX.Element => {
  const {
    page,
    isCurrent = false,
    label,
    disabled: selfDisabled = false,
    children,
  } = props;

  const {
    totalPages,
    loading,
    disabled: allDisabled,
    messages,
    onChange,
  } = useContext(PageContext);

  return (
    <S.Item>
      <S.Page
        label={label || messages.pageNumber(page + 1, totalPages)}
        aria-current={isCurrent ? 'page' : undefined}
        aria-busy={isCurrent ? loading : undefined}
        current={isCurrent}
        isLoading={isCurrent && loading}
        disabled={allDisabled || selfDisabled}
        onClick={() => onChange(page)}
      >
        {children || page + 1}
      </S.Page>
      {isCurrent && loading &&
        <S.Loading>
          <Spinner size={20}/>
        </S.Loading>
      }
    </S.Item>
  );
};

export default Page;

export type EllipsisProps = {
  /** 0-based start index. */
  start: number;
  /** Inclusive 0-based end index. */
  end: number;
};

export const Ellipsis = (props: EllipsisProps): JSX.Element => {
  const {start, end} = props;
  const {messages} = useContext(PageContext);
  return (
    <S.Item>
      <S.Ellipsis>
        <SROnly>
          {messages.pagesOmitted(start + 1, end + 1)}
        </SROnly>
        &hellip;
      </S.Ellipsis>
    </S.Item>
  );
};
