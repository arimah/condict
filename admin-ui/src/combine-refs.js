export default (...refs) => {
  refs = refs.filter(Boolean);

  switch (refs.length) {
    case 0:
      return undefined;
    case 1:
      return refs[0];
    default:
      return elem => {
        refs.forEach(ref => {
          if (typeof ref === 'function') {
            ref(elem);
          } else {
            ref.current = elem;
          }
        });
      };
  }
};
