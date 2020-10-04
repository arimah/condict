import {Messages} from './types';

const DefaultMessages: Messages = {
  prevPage: () => 'Previous page',
  nextPage: () => 'Next page',
  pagesOmitted: (start, end) => `Pages ${start} to ${end} omitted`,
  pageNumber: (n, count) => `Page ${n} of ${count}`,
};

export default DefaultMessages;
