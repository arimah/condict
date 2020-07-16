import {useState} from 'react';
import {customAlphabet} from 'nanoid';

/**
 * Generates a small, unique string suitable for use as an HTML element ID or
 * other random identifier. The string contains the letters a-z and A-Z only.
 */
const genUniqueId = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  12
);

export default genUniqueId;

/**
 * Implements a hook that returns a persistent, unique ID, suitable for use as
 * an HTML element ID or other random identifier. The string contains the
 * letters a-z and A-Z only.
 */
export const useUniqueId = (): string => useState(genUniqueId)[0];
