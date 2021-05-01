import {IdOf} from '../../graphql/types';

export type DescriptionId = IdOf<'Descripton'>;

export type DescriptionRow = {
  id: DescriptionId;
  /** JSON-serialized data */
  description: string;
};
