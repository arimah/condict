'use strict';

const platform =
  process.env.NODE_PLATFORM
    ? process.env.NODE_PLATFORM
    : process.platform;

Object.defineProperties(exports, {
  __esModule: {
    value: true,
  },
  isMacOS: {
    value: platform === 'darwin',
  },
  isWindows: {
    value: platform === 'win32' || platform === 'cygwin',
  },
  isOther: {
    value:
      platform !== 'darwin' &&
      platform !== 'win32' &&
      platform !== 'cygwin',
  },
  selectPlatform: {
    value: options => {
      switch (platform) {
        case 'darwin':
          return options.macos || options.default;
        case 'win32':
        case 'cygwin':
          return options.windows || options.default;
        default:
          return options.other || options.default;
      }
    },
  },
});
