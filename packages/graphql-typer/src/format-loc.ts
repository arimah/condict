import {Location} from 'graphql';

const formatLocation = (location: Location | undefined): string => {
  if (!location) {
    return '(unknown)';
  }

  const {startToken: {line, column}, source: {name}} = location;
  return `${name}:${line}:${column}`;
};
export default formatLocation;
