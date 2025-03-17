import type { WindowLoadsInterface } from './lib/WindowLoads.js';
import { conversationsPath } from './lib/paths.js';
import { createWindowLoads } from './lib/WindowLoads.js';
import fs from 'fs';
import { ipcMain } from 'electron';

const loadConversations: (url: string) => Promise<void> = async function (
  url: string,
): Promise<void> {
  const window: WindowLoadsInterface = await createWindowLoads({
    show: false,
  });
  const whenStorageLoaded = new Promise<void>((resolve: () => void): any =>
    ipcMain.once('storage-loaded', resolve),
  );

  await window.goto(url);
  await window.appendJsFile('loadStorage.js');
  window.window.webContents.send(
    'load-storage',
    JSON.parse(
      new TextDecoder('UTF-8').decode(fs.readFileSync(conversationsPath)),
    ),
  );

  await Promise.race([window.stoppedGracefully, whenStorageLoaded]);
  await window.close();
};

export default loadConversations;
