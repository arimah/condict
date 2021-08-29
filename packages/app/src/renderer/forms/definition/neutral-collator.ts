/** This collator matches the UNICODE collation used by @condict/server. */
export default new Intl.Collator('en', {
  numeric: true,
  caseFirst: 'lower',
});
