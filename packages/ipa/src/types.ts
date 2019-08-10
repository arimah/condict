export type DataFile = {
  readonly chars: IpaChar[];
  readonly groups: IpaGroup[];
  readonly searchTree: IpaSearchNode[];
};

export type IpaChar = {
  readonly input: string;
  readonly display: string;
  readonly name: string;
  readonly nameWords: string[];
};

export type IpaGroup = {
  readonly name: string;
  /** Character indexes */
  readonly members: number[];
  /** Character index */
  readonly base?: number;
};

export type IpaSearchNode = {
  /** The substring that leads to this node. */
  readonly path: string;
  /** The full term matched by leaves in this node (when `leaves` is defined). */
  readonly term?: string;
  /** Tuples of [character index, score] */
  readonly leaves?: [number, number][];
  readonly branches?: IpaSearchNode[];
};
