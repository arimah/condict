/**
 * Generates a random 7-character string containing digits 0-9 and letters a-z.
 * @return {string}
 */
module.exports = () => Math.random().toString(36).substr(2, 7);
