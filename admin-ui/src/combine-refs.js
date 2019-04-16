export default (...refs) => {
  refs = refs.filter(Boolean);
  return elem => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(elem);
      } else {
        ref.current = elem;
      }
    });
  };
};
