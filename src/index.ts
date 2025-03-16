import { app, ipcMain } from 'electron';
import { conversationsPath, temporaryDirectory } from './lib/paths.js';
import type { Event as ElectronEvent } from 'electron';
import LoadStages from './enums/LoadStages.js';
import type { WindowLoadsInterface } from './lib/WindowLoads.js';
import createServer from './createGpt4FreeServer.js';
import { createWindowLoads } from './lib/WindowLoads.js';
import fs from 'fs';
import loadConversations from './loadConversations.js';
import t from './entrypoint/i18n.js';
import waitPort from 'wait-port';

fs.appendFileSync(conversationsPath, new Uint8Array());
app.setPath('appData', temporaryDirectory);
app.setName('gpt4free-on-electron');

if (!app.requestSingleInstanceLock()) {
  console.log('Application already started');
  app.quit();
}

if (process.platform !== 'darwin') {
  app.on('window-all-closed', function (): void {
    app.quit();
  });
}

async function main(): Promise<void> {
  const window: WindowLoadsInterface = await createWindowLoads();
  await window.loadingPage();
  window.window.on('page-title-updated', function(event: ElectronEvent): void {
    event.preventDefault();
    window.setTitle('ChatGPT4Free');
  });
  const info: (message: string) => void = window.showMessage.bind(window);
  info(t(LoadStages.SEARCH_PORT));

  const host: string = 'localhost';
  const { executionPromise, port, severProcess } = await createServer();
  const url: string = `http://${host}:${port}/chat/`;
  info(t(LoadStages.FOUND_PORT));

  app.on('will-quit', function (): void {
    severProcess.kill();
  });

  info(t(LoadStages.CREATE_SERVER));
  await executionPromise;
  info(t(LoadStages.CREATED_SERVER));
  await waitPort({ host, port, output: 'silent' });
  info(t(LoadStages.LOAD_CONVERSATIONS));
  await loadConversations(url);
  info(t(LoadStages.FINISHED));

  ipcMain.on(
    'storage-changed',
    (event: ElectronEvent, localStorage: any): void => {
      fs.writeFileSync(
        conversationsPath,
        JSON.stringify(localStorage)
      );
    }
  );

  await window.goto(url);
  window.window.on('focus', (): Promise<void> => window.appendJsFile( 'focusMessageInput.js' ));
  await window.appendJsFile( 'focusMessageInput.js' );
  await window.appendJsFile( 'removeVersionWindow.js' );
  await window.appendJsFile( 'methodsWrapper.js' );
  await window.appendJsFile( 'watchStorage.js' );
}

main()
  .catch(async function(message: string) {
    const window: WindowLoadsInterface = await createWindowLoads();
    await window.errorPage();
    window.setTitle('Error');
    window.showMessage(message);
  })
  .catch(function(error: Error): never {
    console.log(error);
    process.exit();
  });
