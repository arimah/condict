import {IpcMainInvokeEvent, ipcMain} from 'electron';

import {RendererChannels} from '../ipc-channels';
import {IpcMessageArg} from '../types';

// This represents a more type-safe IpcMain interface, which only handles
// known message types. Unlike Electron's own IpcMain interface, this one
// *only* supports the new promise-based request-response-style API.

type Awaitable<T> = PromiseLike<T> | T;

export interface IpcMain {
  handle<C extends keyof RendererChannels>(
    channel: C,
    handler: (
      event: IpcMainInvokeEvent,
      ...args: IpcMessageArg<RendererChannels[C]['Arg']>
    ) => Awaitable<RendererChannels[C]['Reply']>
  ): void;

  removeHandler(channel: keyof RendererChannels, handler: Function): void;
}

export default ipcMain as unknown as IpcMain;
