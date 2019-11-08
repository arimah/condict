'use strict';

const platform = require('platform');

let osFamily = String(
  platform.os != null &&
  platform.os.family != null &&
  platform.os.family
);

try {
  const localStoragePlatform = localStorage.getItem('platform');
  if (localStoragePlatform != null) {
    osFamily = localStoragePlatform;
  }
} catch {
  // Ignore errors. Local storage might be disabled, or something.
}

const isMacOS = /os\s*x|mac\s*os/i.test(osFamily);

const isWindows = /windows/i.test(osFamily);

Object.defineProperties(exports, {
  __esModule: {
    value: true,
  },
  isMacOS: {
    value: isMacOS,
  },
  isWindows: {
    value: isWindows,
  },
  isOther: {
    value: !isMacOS && !isWindows,
  },
  selectPlatform: {
    value: options => {
      if (isMacOS) {
        return options.macos || options.default;
      }
      if (isWindows) {
        return options.windows || options.default;
      }
      return options.other || options.default;
    },
  },
});
