import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

// Define the API shape
export type JarvisAPI = {
  // Window controls
  windowMinimize: () => void;
  windowMaximize: () => void;
  windowClose: () => void;

  // IPC communication (to be expanded in later phases)
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
  send: (channel: string, ...args: unknown[]) => void;
};

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
const jarvisAPI: JarvisAPI = {
  // Window controls
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),

  // Generic IPC methods (will be used by specific handlers later)
  invoke: (channel: string, ...args: unknown[]) => {
    // Whitelist of allowed channels (to be expanded)
    const validChannels = [
      'auth:store-token',
      'auth:get-token',
      'auth:list-tokens',
      'auth:delete-token',
      'auth:update-token',
      'settings:get',
      'settings:get-all',
      'settings:update',
      'settings:update-batch',
      'projects:list',
      'projects:get',
      'projects:create',
      'projects:update',
      'projects:delete',
      'agents:list',
      'agents:get',
      'agents:start',
      'agents:stop',
    ];

    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }

    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },

  on: (channel: string, callback: (...args: unknown[]) => void) => {
    // Whitelist of allowed channels for listening
    const validChannels = [
      'agent:update',
      'system:status',
      'notification',
      'log:entry',
    ];

    if (validChannels.includes(channel)) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        callback(...args);
      ipcRenderer.on(channel, subscription);

      // Return unsubscribe function
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }

    return () => {}; // No-op for invalid channels
  },

  send: (channel: string, ...args: unknown[]) => {
    const validChannels = ['window-minimize', 'window-maximize', 'window-close'];

    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
};

// Use contextBridge to expose the API to the renderer process
contextBridge.exposeInMainWorld('jarvis', jarvisAPI);
