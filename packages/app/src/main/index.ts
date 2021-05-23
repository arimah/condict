import {app} from 'electron';

import main from './main';

if (app.requestSingleInstanceLock()) {
  main();
} else {
  app.quit();
}
