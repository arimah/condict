export const mapToArray = (collection, cb) => {
  const result = [];
  collection.forEach((value, key) => {
    result.push(cb(value, key));
  });
  return result;
};
