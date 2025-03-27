import { app, ipcMain } from 'electron';
import { conversationsPath, temporaryDirectory } from './lib/paths.js';
import type { Event as ElectronEvent } from 'electron';
import LoadStages from './enums/LoadStages.js';
import type { WindowLoadsInterface } from './lib/WindowLoads.js';
import createServer from './createGpt4FreeServer.js';
import { createWindowLoads } from './lib/WindowLoads.js';
import fs from 'fs';
import handleChildProcessErrors from './lib/handleChildProcessErrors.js';
import loadConversations from './loadConversations.js';
import skip from './lib/skip.js';
import t from './entrypoint/i18n.js';
import waitPort from 'wait-port';

const isDaemon: boolean = process.argv.includes('--daemon');

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
  const window: WindowLoadsInterface = await createWindowLoads({
    show: !isDaemon,
  });
  app.on('second-instance', function (): void {
    window.window.show();
  });
  await window.loadingPage();
  window.window.on('close', (): void => app.quit());
  window.window.on('page-title-updated', function (event: ElectronEvent): void {
    event.preventDefault();
    window.setTitle('ChatGPT4Free');
  });
  const info: (message: string) => void = window.showMessage.bind(window);
  info(t(LoadStages.SEARCH_PORT));

  const host: string = 'localhost';
  const { executionPromise, port, severProcess } = await createServer();
  handleChildProcessErrors(severProcess);
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
    function (event: ElectronEvent, localStorage: any): void {
      fs.writeFileSync(conversationsPath, JSON.stringify(localStorage));
    },
  );

  await window.goto(url);
  await window.appendJsFile<void>('autoselectMobileVersion.js').catch(skip);
  window.window.on('focus', function (): void {
    window.appendJsFile<void>('focusMessageInput.js').catch(skip);
  });
  await window.appendJsFile<void>('focusMessageInput.js').catch(skip);
  await window.appendJsFile<void>('removeVersionWindow.js').catch(skip);
  await window.appendJsFile<void>('methodsWrapper.js');
  await window.appendJsFile<void>('watchStorage.js');
}

main()
  .catch(async function (message: string) {
    const window: WindowLoadsInterface = await createWindowLoads();
    await window.errorPage();
    window.setTitle('Error');
    window.showMessage(message);
  })
  .catch(function (error: Error): never {
    console.log(error);
    process.exit();
  });
