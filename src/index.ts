import { BrowserWindow, app, screen } from 'electron';
import type { ChildProcessWithoutNullStreams } from 'child_process';
import child_process from 'child_process';
import displayError from './displayError.js';
import { fileURLToPath } from 'url';
import findFreePort from './findFreePort.js';
import fs from 'fs';
import path from 'path';
import waitPort from 'wait-port';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const conversationsPath = path.join(app.getPath('sessionData'), 'conversations.json');
fs.appendFileSync(conversationsPath, new Uint8Array());
app.setPath('appData', app.getPath('temp'));

if (!app.requestSingleInstanceLock()) {
  console.log('Application already started');
  app.quit();
}

async function main(): Promise<void> {
  await app.whenReady();

  const host: string = 'localhost';
  const port: number = await findFreePort() ?? -1;

  if (port === -1) {
    throw new Error('Unexpected null port returned on requesting one');
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const window = new BrowserWindow({
    width: 400,
    height: height,
    x: width - 400,
    y: 0,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false,
    icon: path.join(__dirname, '..', 'assets', 'img', 'icon.png')
  });
  window.setTitle('Loading...');
  window.loadFile(path.join(__dirname, '..', 'views', 'load.html'));

  let stdoutData: string = '';
  let stderrData: string = '';
  const severProcess: ChildProcessWithoutNullStreams = child_process.spawn(
    path.join(__dirname, '..', 'dist', 'server'),
    [ '--port', port.toString() ]
  );
  severProcess.stdout.on('data', function (chunk: any): void {
    stdoutData += chunk.toString();
  });
  severProcess.stderr.on('data', function (chunk: any): void {
    stderrData += chunk.toString();
  });

  app.setName('g4f-electron');
  app.on('will-quit', function (): void {
    severProcess.kill();
  });

  app.on('second-instance', function() {
    window.restore();
    window.focus();
  });

  if (process.platform !== 'darwin') {
    app.on('window-all-closed', function (): void {
      app.quit();
    });
  }

  severProcess.on('exit', function (code: string) {
    code = code ?? '"Без кода"';
    const stdoutMarkup = stdoutData
      .split('\n')
      .map((line: string): string => `<p>${line}</p>`)
      .join('');
    const stderrMarkup = stderrData
      .split('\n')
      .map((line: string): string => `<p>${line}</p>`)
      .join('');
    displayError(
      `<p>Сервер непредсказуемо завершился с кодом ${code}</p>` +
        `<h6>Stdout:</h6>${stdoutMarkup}<h6>Stderr:</h6>${stderrMarkup}`
    );
  });

  await new Promise<undefined>(function (resolve: (value: undefined) => void, reject: (error: Error) => void): void {
    severProcess.on('spawn', resolve);
    severProcess.on('error', reject);
  });
  await waitPort({ host, port, output: 'silent' });

  const javascriptAssets: string = path.join(__dirname, '..', 'assets', 'js');
  const decoder: TextDecoder = new TextDecoder('UTF-8');
  window.setTitle('ChatGPT4Free');
  window.loadURL(`http://${host}:${port}/chat/`);
  const webContents = window.webContents;
  webContents.once('did-finish-load', function(): void {
    webContents
      .executeJavaScript(
        decoder.decode(fs.readFileSync(path.join(javascriptAssets, 'reloadPage.js')))
      );
    webContents
      .executeJavaScript(
        decoder.decode(fs.readFileSync(path.join(javascriptAssets, 'loadStorage.js')))
      )
      .then(function(): void {
        webContents.send(
          'load-storage',
          JSON.parse(decoder.decode(fs.readFileSync(conversationsPath)))
        );
      });
  });
  window.once('close', function(event): void {
    event.preventDefault();
    webContents
      .executeJavaScript('Object.assign({}, window.localStorage)')
      .then(function(localStorage: object): void {
        fs.writeFileSync(conversationsPath, JSON.stringify(localStorage));
        window.destroy();
      });
  });
}

main()
  .catch(displayError)
  .catch(function(error) {
    console.log(error);
    process.exit();
  });
