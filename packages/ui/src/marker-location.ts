type MarkerLocation =
  | 'before'
  | 'after'
  | 'above'
  | 'below'

export default MarkerLocation;

export const markerLocationToFlexDirection = (loc: MarkerLocation): string => {
  switch (loc) {
    case 'before':
      return 'row';
    case 'after':
      return 'row-reverse';
    case 'above':
      return 'column';
    case 'below':
      return 'column-reverse';
  }
};
