export default cell => {
  let description = '';
  if (!cell.header) {
    const {data} = cell;
    if (!data.deriveLemma) {
      description += 'Not added to the dictionary. ';
    }
    if (data.hasCustomDisplayName) {
      description += 'Form has custom name. ';
    }
  }
  return description;
};
