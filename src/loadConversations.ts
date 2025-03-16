import { BrowserWindow, ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { appendJsFile } from './lib/appendJsFile.js';
import { conversationsPath } from './lib/paths.js';
import fs from 'fs';

const loadConversations: (url: string) => Promise<void> = async function(url: string): Promise<void> {
  const preparingWindow: BrowserWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });
  const webContents: WebContents = preparingWindow.webContents;
  const whenStorageLoaded = new Promise<void>(
    (resolve: () => void): any => ipcMain.once('storage-loaded', resolve)
  );

  await preparingWindow.loadURL(url);
  await appendJsFile(webContents, 'loadStorage.js');
  webContents.send(
    'load-storage',
    JSON.parse(new TextDecoder('UTF-8').decode(fs.readFileSync(conversationsPath)))
  );

  await whenStorageLoaded;
  preparingWindow.destroy();
};

export default loadConversations;
