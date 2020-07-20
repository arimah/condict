import {Table} from '../value';

export type TableCommandFn = <D>(table: Table<D>) => Table<D>;
