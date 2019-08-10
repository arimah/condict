export type DataFields = {
  text: string;
  // The below apply only to inflected forms (i.e. data cells)
  deriveLemma: boolean;
  displayName: string;
  hasCustomDisplayName: boolean;
  inflectedFormId: number | null;
};

export type InflectionTableJson = InflectionTableJsonRow[];

export type InflectionTableJsonRow = {
  cells: InflectionTableJsonCell[];
};

export type InflectionTableJsonCell = {
  columnSpan?: number;
  rowSpan?: number;
  headerText?: string;
  inflectedForm?: {
    id: string | null;
    inflectionPattern: string;
    deriveLemma: boolean;
    displayName: string;
    hasCustomDisplayName: boolean;
  };
};
