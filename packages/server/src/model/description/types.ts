import {BlockElementJson} from '../../rich-text';
import {IdOf} from '../../graphql/types';

export type DescriptionId = IdOf<'Descripton'>;

export type DescriptionRow = {
  id: DescriptionId;
  /** JSON-serialized data */
  description: string;
};

export type DescriptionData = {
  id: DescriptionId;
  description: BlockElementJson[];
};
