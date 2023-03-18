/**
 * This collator roughly matches the UNICODE collation used by @condict/server.
 */
export default new Intl.Collator('en', {
  caseFirst: 'lower',
});
