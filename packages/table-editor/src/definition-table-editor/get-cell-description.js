export default cell => {
  if (!cell.header) {
    const {data} = cell;
    switch (data.customForm) {
      case null:
        return 'Form is inflected automatically. ';
      case '':
        return 'Form has been deleted. ';
      default:
        return 'Custom form. ';
    }
  }
  return '';
};
