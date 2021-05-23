import {IpcRendererEvent, ipcRenderer} from 'electron';

import {RendererChannels, MainChannels} from '../ipc-channels';
import {IpcMessageArg} from '../types';

// This represents a more type-safe IpcRenderer interface, which only handles
// known message types.

export interface IpcRenderer {
  invoke<C extends keyof RendererChannels>(
    channel: C,
    ...args: IpcMessageArg<RendererChannels[C]['Arg']>
  ): Promise<RendererChannels[C]['Reply']>;

  on<C extends keyof MainChannels>(
    channel: C,
    listener: (
      event: IpcRendererEvent,
      ...args: IpcMessageArg<MainChannels[C]>
    ) => void
  ): this;

  once<C extends keyof MainChannels>(
    channel: C,
    listener: (
      event: IpcRendererEvent,
      ...args: IpcMessageArg<MainChannels[C]>
    ) => void
  ): this;

  removeAllListeners(channel: keyof MainChannels): this;

  removeListener(channel: keyof MainChannels, listener: Function): this;
}

export default ipcRenderer as unknown as IpcRenderer;
