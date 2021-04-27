import {Operation} from 'slate';

export interface History {
  undos: HistoryState[];
  redos: HistoryState[];
}

export interface HistoryState {
  readonly operations: Operation[];
  // Timestamp from a Date object.
  lastOperationTime: number;
}
