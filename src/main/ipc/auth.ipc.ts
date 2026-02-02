import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import {
  storeToken,
  getToken,
  listTokens,
  deleteToken,
  updateToken,
  type AuthToken,
  type AuthTokenWithPlaintext,
} from '../services/auth-store';

export function registerAuthIpc() {
  // Store a new token
  ipcMain.handle(
    'auth:store-token',
    (
      _event: IpcMainInvokeEvent,
      provider: AuthToken['provider'],
      label: string,
      token: string,
      accountName?: string
    ): string => {
      return storeToken(provider, label, token, accountName);
    }
  );

  // Get a token by ID
  ipcMain.handle(
    'auth:get-token',
    (_event: IpcMainInvokeEvent, id: string): AuthTokenWithPlaintext | null => {
      return getToken(id);
    }
  );

  // List all tokens
  ipcMain.handle('auth:list-tokens', (): AuthToken[] => {
    return listTokens();
  });

  // Delete a token
  ipcMain.handle(
    'auth:delete-token',
    (_event: IpcMainInvokeEvent, id: string): boolean => {
      return deleteToken(id);
    }
  );

  // Update a token
  ipcMain.handle(
    'auth:update-token',
    (
      _event: IpcMainInvokeEvent,
      id: string,
      updates: {
        label?: string;
        token?: string;
        accountName?: string;
      }
    ): boolean => {
      return updateToken(id, updates);
    }
  );
}
